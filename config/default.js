/**
 * Default configuration
 */

// Convert string to boolean
const toBoolean = s => s && s.toString().toLowerCase() === 'true';

module.exports = {
  SAMPLE_TITLE: 'Discussion for a topic', // Sample title to be used for a creating a topic
  SAMPLE_BODY: 'Sample Discussion body for a topic', // Sample body to be used for a creating a topic body
  MODIFIED_TITLE: 'Modified discussion for a topic', // Sample title to be used for a updating a topic
  MODIFIED_BODY: 'Modified sample discussion body for a topic', // Sample body to be used for a updating a topic body
  USER_TOKEN: process.env.USER_TOKEN, // Any Topcoder user valid JWT token
  TO_EMAILS: ['devops+tc-dev@topcoder.com'],
  MAIL_SUBJECT: 'Test results',
  MAIL_BODY: '<p>Latest test results available here </p>',
  SMPT_CONFIG: {
    host: process.env.SMPT_HOST || '',
    port: parseInt(process.env.SMPT_PORT, 10) || 465,
    secure: toBoolean(process.env.SMPT_SECURE) || true, // use TLS
    auth: {
      user: process.env.SMPT_USER || '',
      pass: process.env.SMPT_PASS || ''
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: toBoolean(process.env.SMPT_REJECT_UNAUTHORIZED) || false
    }
  },
  // [Option] For usage of Gmail instaed of SMPT
  GMAIL: {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || '',
      pass: process.env.GMAIL_PASSWORD || ''
    }
  },
  PREFER_GMAIL: toBoolean(process.env.PREFER_GMAIL) || false
};
