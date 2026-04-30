import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

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

app.post('/api/packages', async (req, res) => {
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

app.post('/api/locations', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Location name is required' });
  }

  try {
    const newLocation = await prisma.location.create({
      data: { name },
    });
    res.status(201).json(newLocation);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Location with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.delete('/api/packages/:id', authenticate, authorize(['ADMIN', 'LEADER']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.package.delete({ where: { id } });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/pallets/:id', authenticate, authorize(['ADMIN', 'LEADER']), async (req, res) => {
  const { id } = req.params;
  try {
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

app.post('/api/pallets', async (req, res) => {
  const { palletNumber } = req.body;
  if (!palletNumber) return res.status(400).json({ error: 'Pallet number is required' });

  try {
    const newPallet = await prisma.pallet.create({
      data: { palletNumber },
    });
    res.status(201).json(newPallet);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Pallet already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/api/pallets/add-package', async (req, res) => {
  const { palletId, trackingNumber } = req.body;

  try {
    const pkg = await prisma.package.findUnique({
      where: { trackingNumber }
    });

    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    if (pkg.palletId) return res.status(400).json({ error: 'Package already on another pallet' });

    const updatedPackage = await prisma.package.update({
      where: { id: pkg.id },
      data: { palletId }
    });

    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Movements
app.post('/api/move/pallet', async (req, res) => {
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

    res.json(updatedPallet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Loadings (Shipments)
app.get('/api/loadings', async (req, res) => {
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

app.get('/api/loadings/history', authenticate, async (req, res) => {
  try {
    const history = await prisma.loading.findMany({
      where: { status: 'CLOSED' },
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loadings', async (req, res) => {
  const { driverName, vehicleRegistration } = req.body;
  if (!driverName || !vehicleRegistration) {
    return res.status(400).json({ error: 'Driver and vehicle info required' });
  }

  try {
    const newLoading = await prisma.loading.create({
      data: { driverName, vehicleRegistration }
    });
    res.status(201).json(newLoading);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loadings/add-pallet', async (req, res) => {
  const { loadingId, palletNumber } = req.body;

  try {
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber }
    });

    if (!pallet) return res.status(404).json({ error: 'Pallet not found' });
    if (pallet.status === 'LOADED') return res.status(400).json({ error: 'Pallet already loaded' });

    const updatedPallet = await prisma.pallet.update({
      where: { id: pallet.id },
      data: { 
        loadingId,
        status: 'LOADED',
        locationId: null // Usuwamy z lokalizacji magazynowej
      }
    });

    // Aktualizujemy status wszystkich paczek na palecie
    await prisma.package.updateMany({
      where: { palletId: pallet.id },
      data: { status: 'LOADED', locationId: null }
    });

    res.json(updatedPallet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loadings/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.loading.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() }
    });
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
        include: { pallet: true, location: true }
      }),
      prisma.pallet.findMany({
        where: { packages: { none: {} } },
        include: { location: true }
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
