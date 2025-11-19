#!/usr/bin/env node

/**
 * Rename Assets Script
 *
 * Renames all files and folders in src/assets to be web-safe:
 * - Converts to lowercase
 * - Replaces spaces with dashes
 * - Processes directories and files recursively
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

/**
 * Convert a filename to web-safe format
 */
function toWebSafe(filename) {
  // Get the file extension
  const ext = path.extname(filename);
  const nameWithoutExt = ext ? filename.slice(0, -ext.length) : filename;

  // Convert to lowercase and replace spaces with dashes
  const webSafeName = nameWithoutExt.toLowerCase().replace(/\s+/g, '-');

  return webSafeName + ext.toLowerCase();
}

/**
 * Recursively rename files and directories
 * Process files first, then directories (bottom-up)
 */
function renameRecursively(dir) {
  const items = fs.readdirSync(dir);

  // Separate files and directories
  const files = [];
  const directories = [];

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      directories.push(item);
    } else {
      files.push(item);
    }
  }

  // First, process subdirectories (recursively)
  for (const directory of directories) {
    const fullPath = path.join(dir, directory);
    renameRecursively(fullPath);
  }

  // Then rename files in current directory
  for (const file of files) {
    const oldPath = path.join(dir, file);
    const newName = toWebSafe(file);
    const newPath = path.join(dir, newName);

    if (oldPath !== newPath) {
      console.log(`Renaming file: ${path.relative(ASSETS_DIR, oldPath)} -> ${newName}`);
      fs.renameSync(oldPath, newPath);
    }
  }

  // Finally, rename directories in current directory
  // Use two-step rename to avoid Windows permission issues
  for (const directory of directories) {
    const oldPath = path.join(dir, directory);
    const newName = toWebSafe(directory);
    const newPath = path.join(dir, newName);

    if (oldPath !== newPath) {
      console.log(`Renaming directory: ${path.relative(ASSETS_DIR, oldPath)} -> ${newName}`);

      // Two-step rename to avoid conflicts
      const tempPath = path.join(dir, `_temp_${Date.now()}_${newName}`);
      fs.renameSync(oldPath, tempPath);
      fs.renameSync(tempPath, newPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Renaming assets to web-safe format...\n');
  console.log(`Processing: ${ASSETS_DIR}\n`);

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Error: Assets directory not found at ${ASSETS_DIR}`);
    process.exit(1);
  }

  try {
    renameRecursively(ASSETS_DIR);
    console.log('\n✅ Done! All assets renamed to web-safe format.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
