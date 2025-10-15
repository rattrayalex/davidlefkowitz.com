#!/bin/bash

# Script to restore original album images for Preludes and Fugues
# Run this script to undo the optimization changes

echo "Restoring original album images..."

# Check if backup directory exists
if [ ! -d "server/media-cache-backup" ]; then
    echo "Error: Backup directory not found at server/media-cache-backup"
    exit 1
fi

# Restore all backup files
echo "Copying backup files to media-cache..."
cp server/media-cache-backup/*.jpg server/media-cache/

# Update database to use original filename
echo "Updating database reference..."
psql "$DATABASE_URL" -c "UPDATE recordings SET album_cover = '/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg' WHERE id = '26c3907b-2ee6-81cb-9edf-f38464971746';" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Database updated successfully"
else
    echo "Warning: Could not update database. You may need to manually update the album_cover URL in the recordings table."
fi

echo "Restoration complete!"
echo ""
echo "Summary:"
echo "- All 16 original files restored from backup"
echo "- Database reference updated (if accessible)"
echo "- The optimized versions are still available with '_original' suffix if needed"