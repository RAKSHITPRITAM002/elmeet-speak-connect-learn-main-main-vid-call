import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Delete problematic files
const filesToDelete = [
  'src/pages/Index.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/HomePage.tsx.bak'
];

filesToDelete.forEach(file => {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err.message);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

// Update .gitignore to include these files
const gitignorePath = path.resolve(__dirname, '.gitignore');
let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

const deprecatedFilesSection = `
# Deprecated files
src/pages/Index.tsx
src/pages/HomePage.tsx
src/pages/HomePage.tsx.bak
`;

if (!gitignoreContent.includes('src/pages/Index.tsx')) {
  gitignoreContent += deprecatedFilesSection;
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('Updated .gitignore');
}

console.log('Casing issues fixed!');