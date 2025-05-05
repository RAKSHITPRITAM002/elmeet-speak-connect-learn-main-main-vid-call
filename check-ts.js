import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Run the TypeScript check command and capture the output
  const output = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('TypeScript check passed!');
  fs.writeFileSync('ts-check-output.log', output || 'No errors found.');
} catch (error) {
  // If the check fails, capture the error
  console.error('TypeScript check failed with error:');
  console.error(error.message);
  fs.writeFileSync('ts-check-error.log', error.message);
}