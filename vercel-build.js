import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to list all files in a directory recursively
function listFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      listFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check for case-sensitive filename conflicts
function checkCaseSensitiveConflicts() {
  const files = listFiles('src');
  const lowerCaseMap = {};
  const conflicts = [];
  
  files.forEach(file => {
    const relativePath = path.relative('src', file);
    const lowerCasePath = relativePath.toLowerCase();
    
    if (lowerCaseMap[lowerCasePath] && lowerCaseMap[lowerCasePath] !== relativePath) {
      conflicts.push({
        file1: lowerCaseMap[lowerCasePath],
        file2: relativePath
      });
    } else {
      lowerCaseMap[lowerCasePath] = relativePath;
    }
  });
  
  return conflicts;
}

// Delete problematic files
function deleteProblematicFiles() {
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
}

// Main function
function main() {
  try {
    // Delete problematic files first
    deleteProblematicFiles();
    
    // Check for case-sensitive conflicts
    const conflicts = checkCaseSensitiveConflicts();
    
    if (conflicts.length > 0) {
      console.log('Found case-sensitive filename conflicts:');
      conflicts.forEach(conflict => {
        console.log(`- "${conflict.file1}" conflicts with "${conflict.file2}"`);
      });
      
      fs.writeFileSync('case-conflicts.json', JSON.stringify(conflicts, null, 2));
    } else {
      console.log('No case-sensitive filename conflicts found.');
    }
    
    // Try to run the build
    try {
      console.log('Running build...');
      execSync('npm run build:vite', { stdio: 'inherit' });
      console.log('Build successful!');
    } catch (buildError) {
      console.error('Build failed with error:');
      console.error(buildError.message);
      process.exit(1); // Exit with error code
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();