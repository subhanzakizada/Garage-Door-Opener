const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const testDir = path.join(__dirname, 'tests');

fs.readdirSync(testDir).forEach(file => {
  if (file.endsWith('.test.js')) {
    console.log(`Running test file: ${file}`);
    try {
      const output = execFileSync('node', [path.join(testDir, file)], { encoding: 'utf8' });
      console.log(output.trim());
    } catch (err) {
      console.error(`Error while running test file ${file}:`);
      console.error(err.stderr.toString().trim());
    }
  }
});
