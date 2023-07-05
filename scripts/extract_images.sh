#!/bin/bash

source_folder="./assets"
destination_folder="./tmp/list-img"
log_file="./image_extraction.log"

# Create the destination folder if it doesn't exist
mkdir -p "$destination_folder"

# Copy images recursively
find "$source_folder" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" \) | while IFS= read -r file; do
  destination_path="$destination_folder/$(basename "$file")"
  cp "$file" "$destination_path"
  if [ $? -eq 0 ]; then
    echo "Copied file: $file to $destination_path" >> "$log_file"
  else
    echo "Failed to copy file: $file" >> "$log_file"
  fi
done

if [ $? -eq 0 ]; then
  echo "Images copied successfully. Check the log file for details: $log_file"
else
  echo "Failed to copy images. Please check the log file for details: $log_file"
fi
