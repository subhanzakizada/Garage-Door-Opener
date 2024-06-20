// const fs = require('fs');
// const path = require('path');

// // Directory containing test files
// const testDir = path.join(__dirname, 'tests'); // creating a path, basically testDir = /Users/subhanzaki-zada/Documents/Garage-Door-Opener/tests

// // Read all files from the test directory
// const testFiles = fs.readdirSync(testDir); // an array with the names of the files in the directory passed in

// // console.log(__dirname); // /Users/subhanzaki-zada/Documents/Garage-Door-Opener
// // console.log(__dirname); // [ 'parseCommand.test.js' ]


// // Run each test file
// testFiles.forEach(file => {
//   require(path.join(testDir, file));
// });




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
