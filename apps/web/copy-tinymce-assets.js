import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicTinyMceDir = path.join(__dirname, 'public', 'tinymce');

// Find tinymce in node_modules
let tinymceDir = '';
try {
  // Try resolving from node_modules
  const packageJsonPath = import.meta.resolve('tinymce/package.json');
  tinymceDir = path.dirname(fileURLToPath(packageJsonPath));
} catch (e) {
  // Fallback to searching common paths
  const paths = [
    path.join(__dirname, 'node_modules', 'tinymce'),
    path.join(__dirname, '..', '..', 'node_modules', 'tinymce')
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      tinymceDir = p;
      break;
    }
  }
}

if (!tinymceDir) {
  console.error('Error: Could not find tinymce in node_modules');
  process.exit(1);
}

console.log(`Found TinyMCE at: ${tinymceDir}`);
console.log(`Target directory: ${publicTinyMceDir}`);

// Ensure target dir exists
fs.mkdirSync(publicTinyMceDir, { recursive: true });

// Directories to copy
const dirsToCopy = ['skins', 'themes', 'plugins', 'icons', 'models'];

for (const dir of dirsToCopy) {
  const source = path.join(tinymceDir, dir);
  const target = path.join(publicTinyMceDir, dir);
  
  if (fs.existsSync(source)) {
    console.log(`Copying ${dir}...`);
    fs.cpSync(source, target, { recursive: true, force: true });
  } else {
    console.warn(`Warning: Source directory ${source} does not exist.`);
  }
}

// Copy main files
const filesToCopy = ['tinymce.min.js'];
for (const file of filesToCopy) {
  const source = path.join(tinymceDir, file);
  const target = path.join(publicTinyMceDir, file);
  
  if (fs.existsSync(source)) {
    console.log(`Copying ${file}...`);
    fs.copyFileSync(source, target);
  } else {
    console.warn(`Warning: Source file ${source} does not exist.`);
  }
}

console.log('TinyMCE assets copied successfully!');
