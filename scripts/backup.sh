#!/bin/bash

# Konfiguracja (Pobranie z parametrów lub domyślne)
BACKUP_DIR="/opt/LoadTrack/backups"
RAW_URL=${1:-"postgresql://app:change_me@localhost:5432/appdb?schema=loadtrack"}
# Usuwamy parametr ?schema=... ponieważ pg_dump go nie wspiera w URI
DB_URL=$(echo $RAW_URL | sed 's/?schema=.*//')
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="loadtrack_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Tworzenie katalogu jeśli nie istnieje
mkdir -p "$BACKUP_DIR"

echo "[$TIMESTAMP] Rozpoczynam kopię zapasową bazy LoadTrack..."

# Wykonanie kopii
if pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/$FILENAME"; then
    # Sprawdzenie czy plik ma zawartość (więcej niż nagłówek gzip)
    SIZE=$(stat -c%s "$BACKUP_DIR/$FILENAME")
    if [ "$SIZE" -gt 50 ]; then
        echo "[$TIMESTAMP] Kopia zapasowa zakończona sukcesem: $FILENAME (Rozmiar: $SIZE bajtów)"
        
        # Usuwanie starych kopii
        echo "[$TIMESTAMP] Usuwanie kopii starszych niż $RETENTION_DAYS dni..."
        find "$BACKUP_DIR" -name "loadtrack_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    else
        echo "[$TIMESTAMP] BŁĄD: Plik backupu jest podejrzanie mały ($SIZE bajtów). Sprawdź połączenie!"
        rm "$BACKUP_DIR/$FILENAME"
        exit 1
    fi
else
    echo "[$TIMESTAMP] BŁĄD krytyczny podczas wykonywania pg_dump!"
    exit 1
fi

echo "[$TIMESTAMP] Proces backupu zakończony."
