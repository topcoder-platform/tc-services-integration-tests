/**
 * Default configuration
 */

module.exports = {
  SAMPLE_TITLE: 'Discussion for a topic', // Sample title to be used for a creating a topic
  SAMPLE_BODY: 'Sample Discussion body for a topic', // Sample body to be used for a creating a topic body
  MODIFIED_TITLE: 'Modified discussion for a topic', // Sample title to be used for a updating a topic
  MODIFIED_BODY: 'Modified sample discussion body for a topic', // Sample body to be used for a updating a topic body
  USER_TOKEN: process.env.USER_TOKEN, // Any Topcoder user valid JWT token
  TO_EMAILS: ['sharathkumaranbu@gmail.com', 'sharathkumar.anbu@st.niituniversity.in'],
  MAIL_SUBJECT: 'Test results',
  MAIL_BODY: '<p>Latest test results available here </p>'
};
