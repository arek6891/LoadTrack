import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import * as XLSX from 'xlsx';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

const createAuditLog = async (
  entity: 'PACKAGE' | 'PALLET' | 'LOADING' | 'USER' | 'LOCATION' | 'TEMPLATE',
  entityId: string,
  action: string,
  details?: string,
  userId?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        details,
        userId
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

app.use(cors());
app.use(express.json());

// Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Auth
app.get('/api/users', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  const { username, password, role } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role: role || 'OPERATOR' }
    });

    await createAuditLog('USER', user.id, 'CREATED', `Utworzono użytkownika: ${username} (${user.role})`, req.user.id);

    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.patch('/api/users/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  const { role, password } = req.body;

  try {
    const data: any = {};
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, role: true }
    });

    await createAuditLog('USER', id, 'UPDATED', `Zaktualizowano dane użytkownika: ${updatedUser.username}`, req.user.id);

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  try {
    // Zapobiegamy usunięciu samego siebie
    if ((req.user as any).id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete) {
      await createAuditLog('USER', id, 'DELETED', `Usunięto użytkownika: ${userToDelete.username}`, req.user.id);
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
  res.json({ token, user: { username: user.username, role: user.role } });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/packages', authenticate, async (req: any, res: any) => {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  try {
    const newPackage = await prisma.package.create({
      data: {
        trackingNumber,
        status: 'IN_STOCK',
      },
    });

    await createAuditLog('PACKAGE', newPackage.id, 'CREATED', `Zeskanowano paczkę: ${trackingNumber}`, req.user.id);

    res.status(201).json(newPackage);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Package with this tracking number already exists' });
    } else {
      console.error('Error creating package:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { packages: true, pallets: true }
        }
      }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/locations', authenticate, authorize(['ADMIN', 'LEADER']), async (req: any, res: any) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Location name is required' });
  }

  try {
    const newLocation = await prisma.location.create({
      data: { name },
    });

    await createAuditLog('LOCATION', newLocation.id, 'CREATED', `Dodano lokalizację: ${name}`, req.user.id);

    res.status(201).json(newLocation);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Location with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.delete('/api/packages/:id', authenticate, authorize(['ADMIN', 'LEADER']), async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (pkg) {
      await createAuditLog('PACKAGE', id, 'DELETED', `Usunięto paczkę: ${pkg.trackingNumber}`, req.user.id);
    }
    await prisma.package.delete({ where: { id } });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/pallets/:id', authenticate, authorize(['ADMIN', 'LEADER']), async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const pallet = await prisma.pallet.findUnique({ where: { id } });
    if (pallet) {
      await createAuditLog('PALLET', id, 'DELETED', `Usunięto paletę: ${pallet.palletNumber}`, req.user.id);
    }
    // Uwaga: Najpierw trzeba odpiąć paczki lub usunąć je kaskadowo w schemacie
    await prisma.package.updateMany({
      where: { palletId: id },
      data: { palletId: null }
    });
    await prisma.pallet.delete({ where: { id } });
    res.json({ message: 'Pallet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pallets
app.get('/api/pallets/:palletNumber', async (req, res) => {
  const { palletNumber } = req.params;
  try {
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber },
      include: { packages: true, location: true }
    });
    if (!pallet) return res.status(404).json({ error: 'Pallet not found' });
    res.json(pallet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/pallets', authenticate, async (req: any, res: any) => {
  const { palletNumber } = req.body;
  if (!palletNumber) return res.status(400).json({ error: 'Pallet number is required' });

  try {
    const newPallet = await prisma.pallet.create({
      data: { palletNumber },
    });

    await createAuditLog('PALLET', newPallet.id, 'CREATED', `Utworzono paletę: ${palletNumber}`, req.user.id);

    res.status(201).json(newPallet);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Pallet already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/api/pallets/add-package', authenticate, async (req: any, res: any) => {
  const { palletId, trackingNumber } = req.body;

  try {
    const pkg = await prisma.package.findUnique({
      where: { trackingNumber },
      include: { pallet: true }
    });

    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    if (pkg.palletId) return res.status(400).json({ error: 'Package already on another pallet' });

    const pallet = await prisma.pallet.findUnique({ where: { id: palletId } });
    if (!pallet) return res.status(404).json({ error: 'Pallet not found' });

    const updatedPackage = await prisma.package.update({
      where: { id: pkg.id },
      data: { palletId }
    });

    await createAuditLog('PACKAGE', pkg.id, 'ADDED_TO_PALLET', `Dodano paczkę ${trackingNumber} do palety ${pallet.palletNumber}`, req.user.id);

    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Movements
app.post('/api/move/pallet', authenticate, async (req: any, res: any) => {
  const { palletNumber, locationName } = req.body;

  try {
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber }
    });

    const location = await prisma.location.findUnique({
      where: { name: locationName }
    });

    if (!pallet) return res.status(404).json({ error: 'Pallet not found' });
    if (!location) return res.status(404).json({ error: 'Location not found' });

    const updatedPallet = await prisma.pallet.update({
      where: { id: pallet.id },
      data: { locationId: location.id },
      include: { packages: true, location: true }
    });

    // Opcjonalnie: Aktualizujemy lokalizację wszystkich paczek na tej palecie
    await prisma.package.updateMany({
      where: { palletId: pallet.id },
      data: { locationId: location.id }
    });

    await createAuditLog('PALLET', pallet.id, 'MOVED', `Przeniesiono paletę ${palletNumber} do lokalizacji ${locationName}`, req.user.id);

    res.json(updatedPallet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Loadings (Shipments)
app.get('/api/loadings', authenticate, async (req: any, res: any) => {
  try {
    const loadings = await prisma.loading.findMany({
      where: { status: 'OPEN' },
      include: { _count: { select: { pallets: true } } }
    });
    res.json(loadings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/loadings/history', authenticate, async (req: any, res: any) => {
  const { startDate, endDate, driverName } = req.query;

  try {
    const where: any = { status: 'CLOSED' };

    if (startDate || endDate) {
      where.closedAt = {};
      if (startDate) where.closedAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.closedAt.lte = end;
      }
    }

    if (driverName) {
      where.driverName = {
        contains: driverName as string,
        mode: 'insensitive'
      };
    }

    const history = await prisma.loading.findMany({
      where,
      include: { 
        _count: { select: { pallets: true } },
        pallets: {
          include: { _count: { select: { packages: true } } }
        }
      },
      orderBy: { closedAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loadings', authenticate, async (req: any, res: any) => {
  const { driverName, vehicleRegistration, expectedPallets } = req.body;
  if (!driverName || !vehicleRegistration) {
    return res.status(400).json({ error: 'Driver and vehicle info required' });
  }

  try {
    const newLoading = await prisma.loading.create({
      data: { 
        driverName, 
        vehicleRegistration,
        expectedPallets: Array.isArray(expectedPallets) ? expectedPallets : []
      }
    });

    await createAuditLog('LOADING', newLoading.id, 'CREATED', `Utworzono załadunek: ${driverName} (${vehicleRegistration})`, req.user.id);

    res.status(201).json(newLoading);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/loadings/:id', authenticate, async (req: any, res: any) => {
  const { id } = req.params;
  const { expectedPallets, driverName, vehicleRegistration } = req.body;

  try {
    const data: any = {};
    if (expectedPallets !== undefined) data.expectedPallets = expectedPallets;
    if (driverName) data.driverName = driverName;
    if (vehicleRegistration) data.vehicleRegistration = vehicleRegistration;

    const updated = await prisma.loading.update({
      where: { id },
      data
    });

    await createAuditLog('LOADING', id, 'UPDATED', `Zaktualizowano dane załadunku`, req.user.id);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loadings/add-pallet', authenticate, async (req: any, res: any) => {
  const { loadingId, palletNumber } = req.body;

  try {
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber }
    });

    if (!pallet) return res.status(404).json({ error: 'Pallet not found' });
    if (pallet.status === 'LOADED') return res.status(400).json({ error: 'Pallet already loaded' });

    const loading = await prisma.loading.findUnique({ where: { id: loadingId } });
    if (!loading) return res.status(404).json({ error: 'Loading not found' });

    // Walidacja czy paleta jest na liście oczekiwanych (opcjonalne ostrzeżenie, ale pozwalamy)
    const isExpected = loading.expectedPallets.length === 0 || loading.expectedPallets.includes(palletNumber);

    const updatedPallet = await prisma.pallet.update({
      where: { id: pallet.id },
      data: { 
        loadingId,
        status: 'LOADED',
        locationId: null 
      }
    });

    await prisma.package.updateMany({
      where: { palletId: pallet.id },
      data: { status: 'LOADED', locationId: null }
    });

    await createAuditLog('PALLET', pallet.id, 'LOADED', `Załadowano paletę ${palletNumber} na transport ${loading.driverName}`, req.user.id);

    res.json({ ...updatedPallet, isExpected });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loadings/:id/close', authenticate, async (req: any, res: any) => {
  const { id } = req.params;
  const { force } = req.body;

  try {
    const loading = await prisma.loading.findUnique({
      where: { id },
      include: { pallets: true }
    });

    if (!loading) return res.status(404).json({ error: 'Loading not found' });

    if (loading.expectedPallets.length > 0 && !force) {
      const loadedPalletNumbers = loading.pallets.map(p => p.palletNumber);
      const missingPallets = loading.expectedPallets.filter(p => !loadedPalletNumbers.includes(p));
      
      if (missingPallets.length > 0) {
        return res.status(400).json({ 
          error: 'INCOMPLETE_LOADING', 
          missingPallets,
          message: `Brakuje ${missingPallets.length} palet z planowanej listy.`
        });
      }
    }

    await prisma.loading.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() }
    });

    await createAuditLog('LOADING', id, 'CLOSED', `Zamknięto załadunek: ${loading.driverName}`, req.user.id);

    res.json({ message: 'Loading closed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global Search
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query is required' });

  const query = String(q);

  try {
    // Szukamy paczki
    const pkg = await prisma.package.findUnique({
      where: { trackingNumber: query },
      include: { pallet: true, location: true }
    });

    if (pkg) {
      return res.json({ type: 'package', data: pkg });
    }

    // Jeśli nie paczka, szukamy palety
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber: query },
      include: { packages: true, location: true, loading: true }
    });

    if (pallet) {
      return res.json({ type: 'pallet', data: pallet });
    }

    res.status(404).json({ error: 'Nie znaleziono paczki ani palety o tym numerze' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stats & Dashboard
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      packageStats,
      palletStats,
      locationCount,
      todayLoadings
    ] = await Promise.all([
      // Statystyki paczek wg statusu
      prisma.package.groupBy({
        by: ['status'],
        _count: true
      }),
      // Statystyki palet wg statusu
      prisma.pallet.groupBy({
        by: ['status'],
        _count: true
      }),
      // Liczba lokalizacji
      prisma.location.count(),
      // Dzisiejsze zamknięte załadunki
      prisma.loading.findMany({
        where: {
          status: 'CLOSED',
          closedAt: {
            gte: today
          }
        },
        include: {
          _count: {
            select: { pallets: true }
          }
        }
      })
    ]);

    // Dodatkowe statystyki: zajętość lokalizacji
    const occupiedLocations = await prisma.location.count({
      where: {
        OR: [
          { packages: { some: {} } },
          { pallets: { some: {} } }
        ]
      }
    });

    res.json({
      packages: packageStats,
      pallets: palletStats,
      locations: {
        total: locationCount,
        occupied: occupiedLocations
      },
      today: {
        closedLoadings: todayLoadings.length,
        loadedPallets: todayLoadings.reduce((acc, curr) => acc + curr._count.pallets, 0)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reports
app.get('/api/reports/inventory', authenticate, async (req: any, res: any) => {
  try {
    const [packages, pallets] = await Promise.all([
      prisma.package.findMany({
        select: {
          trackingNumber: true,
          status: true,
          createdAt: true,
          pallet: { select: { palletNumber: true } },
          location: { select: { name: true } }
        }
      }),
      prisma.pallet.findMany({
        where: { packages: { none: {} } },
        select: {
          palletNumber: true,
          status: true,
          createdAt: true,
          location: { select: { name: true } }
        }
      })
    ]);

    const reportData = [
      ...packages.map(p => ({
        type: 'PACZKA',
        number: p.trackingNumber,
        status: p.status,
        parentPallet: p.pallet?.palletNumber || '-',
        location: p.location?.name || '-',
        createdAt: p.createdAt
      })),
      ...pallets.map(p => ({
        type: 'PALETA',
        number: p.palletNumber,
        status: p.status,
        parentPallet: 'N/A',
        location: p.location?.name || '-',
        createdAt: p.createdAt
      }))
    ];

    res.json(reportData);
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Label Templates
app.get('/api/label-templates', authenticate, async (req, res) => {
  try {
    const templates = await prisma.labelTemplate.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/label-templates/default/:type', authenticate, async (req, res) => {
  const { type } = req.params;
  try {
    const template = await prisma.labelTemplate.findFirst({
      where: { type: type as any, isDefault: true }
    });
    if (!template) {
      // Jeśli brak domyślnego, weź najnowszy tego typu
      const fallback = await prisma.labelTemplate.findFirst({
        where: { type: type as any },
        orderBy: { updatedAt: 'desc' }
      });
      return res.json(fallback);
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/label-templates', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  const { name, type, htmlContent, cssContent, isDefault } = req.body;

  if (!name || !type || !htmlContent) {
    return res.status(400).json({ error: 'Name, type and htmlContent are required' });
  }

  try {
    if (isDefault) {
      await prisma.labelTemplate.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.labelTemplate.create({
      data: { 
        name, 
        type, 
        htmlContent, 
        cssContent: cssContent || '', 
        isDefault: !!isDefault 
      }
    });

    await createAuditLog('TEMPLATE', template.id, 'CREATED', `Dodano szablon: ${name}`, req.user.id);

    res.status(201).json(template);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Template with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.patch('/api/label-templates/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  const { name, type, htmlContent, cssContent, isDefault } = req.body;

  try {
    if (isDefault) {
      const current = await prisma.labelTemplate.findUnique({ where: { id } });
      const targetType = type || current?.type;
      
      await prisma.labelTemplate.updateMany({
        where: { type: targetType, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.labelTemplate.update({
      where: { id },
      data: { 
        name, 
        type, 
        htmlContent, 
        cssContent, 
        isDefault 
      }
    });

    await createAuditLog('TEMPLATE', id, 'UPDATED', `Zaktualizowano szablon: ${template.name}`, req.user.id);

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/label-templates/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const template = await prisma.labelTemplate.findUnique({ where: { id } });
    if (template) {
      await createAuditLog('TEMPLATE', id, 'DELETED', `Usunięto szablon: ${template.name}`, req.user.id);
    }
    await prisma.labelTemplate.delete({ where: { id } });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mass Import
app.post('/api/import', authenticate, authorize(['ADMIN', 'LEADER']), upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { type } = req.body; // 'PACKAGE' or 'PALLET'

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let importedCount = 0;
    let skippedCount = 0;

    if (type === 'PACKAGE') {
      for (const row of data) {
        const trackingNumber = String(row.trackingNumber || row.number || row.tracking || '').trim();
        if (!trackingNumber) {
          skippedCount++;
          continue;
        }

        try {
          await prisma.package.create({
            data: { trackingNumber, status: 'IN_STOCK' }
          });
          importedCount++;
        } catch (err) {
          skippedCount++;
        }
      }
      await createAuditLog('PACKAGE', 'MASS_IMPORT', 'IMPORTED', `Import masowy paczek: +${importedCount}, pominięto: ${skippedCount}`, req.user.id);
    } else if (type === 'PALLET') {
      for (const row of data) {
        const palletNumber = String(row.palletNumber || row.number || row.pallet || '').trim();
        if (!palletNumber) {
          skippedCount++;
          continue;
        }

        try {
          await prisma.pallet.create({
            data: { palletNumber, status: 'IN_STOCK' }
          });
          importedCount++;
        } catch (err) {
          skippedCount++;
        }
      }
      await createAuditLog('PALLET', 'MASS_IMPORT', 'IMPORTED', `Import masowy palet: +${importedCount}, pominięto: ${skippedCount}`, req.user.id);
    } else {
      return res.status(400).json({ error: 'Invalid import type' });
    }

    res.json({ importedCount, skippedCount });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Audit Logs Endpoint
app.get('/api/audit-logs', authenticate, authorize(['ADMIN', 'LEADER']), async (req: any, res: any) => {
  const { entity, entityId, limit = 50 } = req.query;

  try {
    const where: any = {};
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
