require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const logger = require('./logger');

const testDir = path.join(__dirname, 'tests');

fs.readdirSync(testDir).forEach(file => {
  if (file.endsWith('.test.js')) {
    logger.info(`Running test file: ${file}`);
    logger.info('-----------------------------------');
    try {
      const output = execFileSync('node', [path.join(testDir, file)], { encoding: 'utf8' });
      logger.info(output.trim());
    } catch (err) {
      logger.error(`Error while running test file ${file}:`);
      logger.error(err.stderr.toString().trim());
    }
  }
});
