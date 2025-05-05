import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Run the build command and capture the output
  const output = execSync('npm run build', { encoding: 'utf8' });
  console.log(output);
  fs.writeFileSync('build-output.log', output);
} catch (error) {
  // If the build fails, capture the error
  console.error('Build failed with error:');
  console.error(error.message);
  fs.writeFileSync('build-error.log', error.message);
}