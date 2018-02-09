# Topcoder Backend Testing suite

## Objective
To create a testing suite which will test Topcoder backend services and send the test results via email.

## Prerequisites
- Node 8.X
- Npm 5.X
- [Topcoder Message service](https://github.com/topcoder-platform/tc-message-service) hosted locally or remotely
- Valid Google account

## Notes while setting up Topcoder Message service

- If you are setting up Topcoder Message service in Ubuntu, You may come across this error `NoMethodError: undefined method `skip_before_filter' for SessionController:Class`

Refer: https://stackoverflow.com/questions/45015651/undefined-method-for-before-filter
To overcome this error, You need to do the following steps
`
docker exec -it discourse_dev /bin/bash
cd src/plugins/discourse_sso_redirect/
vi plugin.rb
`
In Line No. 8, change `skip_before_filter` to `skip_before_action`.

- Likewise, While executing the command `sequelize db:migrate`, You may come across an error `sequelize is not defined`.

To resolve it, add the following line in `scripts` part of `package.json` of `tc-message-service` local code.
```
"sequelize:migrate": "sequelize db:migrate"
```

Post that execute,
```
NODE_ENV=development npm run sequelize:migrate
NODE_ENV=test npm run sequelize:migrate
```

## Getting Google Service Key file and setting Environment variables

1. Before running our tests, There is a need to get google service key file since the test results are uploaded to Google drive and being shared with the user.

2. Login to your google account and navigate to `https://console.developers.google.com` and `select or create a project`

3. In the dashboard page, Click on `Enable APIs and Services`

4. Search for `Google Drive API` and enable it

5. After enabling API, come back to Dashboard page and Click on `Credentials`

6. In `Create Credentials`, select `Service account key` and download the key in JSON format

7. Rename the key as `google_keys.json` and place it in project root directory

8. Set your gmail user name and password as Environment variables
In Linux,
```
export GMAIL_USER=<user_name>
export GMAIL_PASSWORD=<password>
```

9. Set the following User token as described in `tc-message-service` to access as User `magrathean`
```
export USER_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJhZG1pbmlzdHJhdG9yIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJtYWdyYXRoZWFuIiwiZXhwIjoxNzY2Mjg5MjQ2LCJ1c2VySWQiOiI0MDAxMTU3OCIsImlhdCI6MTQ1MDkyOTI0NiwiZW1haWwiOm51bGwsImp0aSI6IjEzNjljNjAwLWUwYTEtNDUyNS1hN2M3LTU2YmU3ZDgxM2Y1MSJ9.SeLETowyDVJCGKGc0wjk4fPMH9pug7C9Yw_7xkI7Fvk
```

## Configuration file
If required following variables can be re-configured in `config/default.js`

- `TO_EMAILS`: Array of emails to which Test results need to be sent
- `MAIL_SUBJECT`: Test results EMAIL Subject
- `MAIL_BODY`: Test results EMAIL Body

## Steps to run tests

1. Install Npm dependencies by executing the following command in project root folder.
```
npm i
```
2. Create a test configuration file or use the existing configuration file `testConfig.json`

In the configuration file, all the tests should be written inside `tests` array.
Sample Test format:
```
{
  "service_name": "tc-message-service",
  "service_base_url": "http://local.topcoder-dev.com:8001",
  "read_only_test" : "Y"
}
```
- `service_name`: should be same as test file in the `tests/` directory
- `service_base_url`: URL against which tests need to be executed
- `read_only_test`: If "Y", only GET end points test will be executed

3. Run the test as
```
npm run testConfig.json
```

After executing the tests, Tests results will be emailed to the given emails.

**Note**
1. If you are running tests continuously, Most probably Discourse will start responding with 429 for valid requests, so it may cause failure of tests

2. If you get 429 for `POST /v4/topics`, `DELETE /v4/topics` will also fail since I am creating a topic before it could be deleted.

3. Sometimes `POST /v4/topics/image` is getting timed out for no reason.

4. **If you are executing read only tests, Make sure to configure the variables `topicId, updPostId` with valid topic ID and post ID values by executing Postman scripts in `tc-message-service` manually. Initially when I started `tc-message-service` the ids which I have given in test script were present in discourse by default. You could recheck if it exists already or recreate with Postman collection provided there.**

5. Sometimes files being uploaded to Google drive is getting corrupted, unsure what is the cause.
