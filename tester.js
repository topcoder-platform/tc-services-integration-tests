/*
 * Topcoder backend services test suite
 */

const jsonfile = require('jsonfile');
const path = require('path');
const Mocha = require('mocha');
const winston = require('winston');

if (process.argv.length !== 3 || path.extname(process.argv[2]).toLowerCase() !== '.json') {
  winston.info('Usage: npm start <test_config_file>.json');
  process.exit();
}

const mocha = new Mocha({
  reporter: 'mochawesome',
});

const testConfig = jsonfile.readFileSync(process.argv[2]);
// Add files for testing
testConfig.tests.forEach((test, index) => { // eslint-disable-line no-unused-vars
  process.env[`${test.service_name}-url`] = test.service_base_url;
  if (test.read_only_test && test.read_only_test === 'Y') {
    process.env[`${test.service_name}-read-only`] = true;
  } else {
    process.env[`${test.service_name}-read-only`] = false;
  }
  mocha.addFile(path.join(`tests/${test.service_name}.js`));
});


// Run the tests.
mocha.run()
  .on('fail', (test, err) => {
    winston.error('Test failed');
    winston.info(err);
  })
  .on('end', () => {
    winston.info('All tests completed');
  });
