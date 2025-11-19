import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsPath = path.join(__dirname, '..', 'src', 'assets', 'factions');

function renameFilesInDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let renamedCount = 0;

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      renamedCount += renameFilesInDirectory(fullPath);
    } else {
      // Process files
      const ext = path.extname(file);
      const nameWithoutExt = path.basename(file, ext);

      // Remove -black or -white only if it's at the end of the filename (before extension)
      let newName = nameWithoutExt;
      if (newName.endsWith('-black')) {
        newName = newName.slice(0, -6); // Remove '-black'
      } else if (newName.endsWith('-white')) {
        newName = newName.slice(0, -6); // Remove '-white'
      }

      // Remove any trailing hyphens
      newName = newName.replace(/-+$/, '');

      // Only rename if the name changed
      if (newName !== nameWithoutExt) {
        const newFullPath = path.join(dirPath, newName + ext);
        console.log(`Renaming: ${file} -> ${newName + ext}`);
        fs.renameSync(fullPath, newFullPath);
        renamedCount++;
      }
    }
  });

  return renamedCount;
}

console.log('Starting file rename process...');
console.log(`Scanning: ${assetsPath}\n`);

try {
  const totalRenamed = renameFilesInDirectory(assetsPath);
  console.log(`\nComplete! Renamed ${totalRenamed} file(s).`);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
