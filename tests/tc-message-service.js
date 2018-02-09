/* eslint-disable comma-dangle */

/*
 * TC Message service related tests
 */

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const fs = require('fs');
const helper = require('../helper');
const path = require('path');
const winston = require('winston');

chai.should();
chai.use(chaiHttp);

describe('Topcoder Message Service', () => {
  // Configure the below variables with valid values if you are running read only tests.
  let topicId = 11;
  let updPostId = 14;
  /*
   * Test POST /topics route
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    describe('POST /topics', () => {
      it('Topic creation should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Topic creation should fail when reference is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "reference" is required');
            done();
          });
      });
      it('Topic creation should fail when referenceId is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ reference: 'submission' })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "referenceId" is required');
            done();
          });
      });
      it('Topic creation should fail when tag is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ reference: 'submission', referenceId: '455' })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "tag" is required');
            done();
          });
      });
      it('Topic creation should fail when title is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ reference: 'submission', referenceId: '455', tag: 'secondary' })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "title" is required');
            done();
          });
      });
      it('Topic creation should fail when body is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({
            reference: 'submission', referenceId: '455', tag: 'secondary', title: config.SAMPLE_TITLE
          })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "body" is required');
            done();
          });
      });
      it('Topic creation should fail when user doesn not have access to the entity', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({
            reference: 'submission', referenceId: '425', tag: 'secondary', title: config.SAMPLE_TITLE, body: config.SAMPLE_BODY
          })
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql("User doesn't have access to the entity");
            done();
          });
      });
      it('Topic creation should succeed when all necessary fields are present', (done) => {
        const postTitle = helper.randomStr(32);
        const postBody = helper.randomStr(50);
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({
            reference: 'submission', referenceId: '455', tag: 'PRIMARY', title: postTitle, body: postBody
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
            res.body.result.success.should.be.eql(true);
            res.body.result.status.should.be.eql(200);
            res.body.result.content.should.have.all.keys('id', 'dbId', 'reference', 'referenceId', 'date', 'lastActivityAt', 'title', 'read', 'userId', 'tag', 'totalPosts', 'retrievedPosts', 'postIds', 'posts');
            res.body.result.content.id.should.not.be.eql(null);
            res.body.result.content.reference.should.be.eql('submission');
            res.body.result.content.referenceId.should.be.eql('455');
            res.body.result.content.date.should.not.be.eql(null);
            res.body.result.content.title.should.be.eql(postTitle);
            res.body.result.content.postIds.should.be.a('array');
            res.body.result.content.posts.should.be.a('array');
            res.body.result.content.posts[0].rawContent.should.be.eql(postBody);
            topicId = res.body.result.content.id;
            updPostId = res.body.result.content.posts[0].id;
            done();
          });
      }).timeout(20000);
    });
  }
  /*
   * Test GET /topics route
   */
  describe('GET /topics', () => {
    it('Get topics should fail when there is no Authorization', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics')
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(403);
          res.body.result.content.message.should.be.eql('No token provided.');
          done();
        });
    });
    it('Get topics should fail when filter parameter is not present', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(400);
          res.body.result.content.message.should.be.eql('Validation error: "filter" is required');
          done();
        });
    });
    it('Get topics should fail when filter parameter is not present', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(400);
          res.body.result.content.message.should.be.eql('Validation error: "filter" is required');
          done();
        });
    });
    it('Get topics should fail when filter parameter is empty', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics?filter')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(400);
          res.body.result.content.message.should.be.eql('Validation error: "filter" is not allowed to be empty');
          done();
        });
    });
    it('Get topics should fail when reference is not present in filter', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics?filter=""')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(400);
          res.body.result.content.message.should.be.eql('Please provide reference and referenceId filter parameters');
          done();
        });
    });
    it('Get topics should fail when referenceId is not present in filter', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics?filter=reference%3Dsubmission')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(400);
          res.body.result.content.message.should.be.eql('Please provide reference and referenceId filter parameters');
          done();
        });
    });
    it('Get topics count should be 0 if there are no topics for given reference ID', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics?filter=reference%3Dsubmission%26referenceId%3D25')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
          res.body.result.success.should.be.eql(true);
          res.body.result.status.should.be.eql(200);
          res.body.result.content.should.be.empty; // eslint-disable-line no-unused-expressions
          res.body.result.metadata.totalCount.should.be.eql(0);
          done();
        });
    });
    it('Get topics should return valid data for existing topics', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics?filter=reference%3Dsubmission%26referenceId%3D455')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
          res.body.result.success.should.be.eql(true);
          res.body.result.status.should.be.eql(200);
          res.body.result.content.should.be.a('array');
          res.body.result.content[0].should.have.all.keys('id', 'dbId', 'reference', 'referenceId', 'date', 'lastActivityAt', 'title', 'read', 'userId', 'tag', 'totalPosts', 'retrievedPosts', 'postIds', 'posts');
          res.body.result.metadata.totalCount.should.be.gt(0);
          done();
        });
    }).timeout(30000);
  });

  /*
   * Test GET /topics/:id route
   */
  describe('GET /topics/:id', () => {
    it('Get topic should fail when there is no Authorization', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics/1')
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(403);
          res.body.result.content.message.should.be.eql('No token provided.');
          done();
        });
    });
    it('Get topic should fail for non existent topics', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics/12345')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(404);
          res.body.result.content.message.should.be.eql('Topic does not exist');
          done();
        });
    });
    it('Get topic should succeed for valid topic', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}`)
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
          res.body.result.success.should.be.eql(true);
          res.body.result.status.should.be.eql(200);
          res.body.result.content.should.have.all.keys('id', 'dbId', 'reference', 'referenceId', 'date', 'lastActivityAt', 'title', 'read', 'userId', 'tag', 'totalPosts', 'retrievedPosts', 'postIds', 'posts');
          res.body.result.content.id.should.not.be.eql(null);
          res.body.result.content.reference.should.be.eql('submission');
          res.body.result.content.referenceId.should.be.eql('455');
          res.body.result.content.date.should.not.be.eql(null);
          res.body.result.content.postIds.should.be.a('array');
          res.body.result.content.posts.should.be.a('array');
          done();
        });
    }).timeout(10000);
  });
  /*
   * Test POST /topics/:id/edit route
   * Above route is used to update topics
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    describe('POST /topics/:id/edit', () => {
      it('Topic update should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/edit`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Topic update should fail when title is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "title" is required');
            done();
          });
      });
      it('Topic update should fail when postId is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ title: config.MODIFIED_TITLE })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "postId" is required');
            done();
          });
      });
      it('Topic update should fail when content is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ title: config.MODIFIED_TITLE, postId: updPostId })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "content" is required');
            done();
          });
      });
      it('Topic update should fail for non existent topics', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics/12345/edit')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ title: config.MODIFIED_TITLE, postId: 12548, content: config.MODIFIED_BODY })
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('Error updating topic');
            done();
          });
      });
      it('Topic update should fail for non existent posts', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ title: config.MODIFIED_TITLE, postId: 12345, content: config.MODIFIED_BODY })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(404);
            res.body.result.content.message.should.be.eql('Error updating topic');
            done();
          });
      });
      it('Topic update should succeed for valid topic and post', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ title: config.MODIFIED_TITLE, postId: updPostId, content: config.MODIFIED_BODY })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
            res.body.result.success.should.be.eql(true);
            res.body.result.status.should.be.eql(200);
            res.body.result.content.should.have.all.keys('topic', 'post');
            res.body.result.content.topic.should.have.all.keys('id', 'title', 'fancy_title', 'slug', 'posts_count');
            res.body.result.content.topic.title.should.be.eql(config.MODIFIED_TITLE);
            res.body.result.content.post.should.have.all.keys('id', 'date', 'updatedDate', 'userId', 'read', 'body', 'type');
            res.body.result.content.post.body.should.be.eql(`<p>${config.MODIFIED_BODY}</p>`);
            done();
          });
      }).timeout(20000);
    });
  }
  /*
   * Test DELETE /topics/:id route
   * Above route is used to delete topics
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    let deleteTopicId;
    // Creating a different topic to test delete end point
    chai.request(process.env['tc-message-service-url'])
      .post('/v4/topics')
      .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({
        reference: 'submission', referenceId: '455', tag: 'PRIMARY', title: helper.randomStr(30), body: helper.randomStr(50)
      })
      .end((err, res) => {
        deleteTopicId = res.body.result.content.id;
      });
    describe('DELETE /topics/:id', () => {
      it('Topic deletion should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .delete(`/v4/topics/${deleteTopicId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Topic deletion should fail for non existent topics', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .delete('/v4/topics/12345')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(404);
            res.body.result.content.message.should.be.eql('Error deleting topic');
            done();
          });
      });
      it('Topic deletion should succeed for existing topics', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .delete(`/v4/topics/${deleteTopicId}`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.should.have.all.keys('success', 'status', 'metadata');
            res.body.result.success.should.be.eql(true);
            res.body.result.status.should.be.eql(200);
            res.body.result.metadata.totalCount.should.be.eql(1);
            done();
          });
      }).timeout(10000);
    });
  }
  /*
   * Test POST /topics/:id/posts route
   * Above route is used to create posts
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    describe('POST /topics/:id/posts', () => {
      it('Post creation should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Post creation should fail when post is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "post" is required');
            done();
          });
      });
      it('Post creation should fail for non existent topics', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics/12345/posts')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ post: 'Testing' })
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(422);
            res.body.result.content.message.should.be.eql('Error creating post');
            done();
          });
      });
      it('Post creation should succeed for valid topics', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ post: 'Testing' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
            res.body.result.success.should.be.eql(true);
            res.body.result.status.should.be.eql(200);
            res.body.result.content.should.have.all.keys('id', 'date', 'updatedDate', 'userId', 'read', 'body', 'type');
            res.body.result.content.body.should.be.eql('<p>Testing</p>');
            res.body.result.metadata.totalCount.should.be.eql(1);
            updPostId = res.body.result.content.id;
            done();
          });
      });
    });
  }
  /*
   * Test GET /topics/:topicId/posts route
   */
  describe('GET /topics/:topicId/posts', () => {
    it('Get posts should fail when there is no Authorization', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts`)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(403);
          res.body.result.content.message.should.be.eql('No token provided.');
          done();
        });
    });
    it('Get posts should fail when postIds parameter is not present', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts`)
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('Get posts should fail for non existent topics', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics/12345/posts?postIds=1234')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(404);
          res.body.result.content.message.should.be.eql('Error fetching post');
          done();
        });
    });
    it('Get posts count should be 0 for non existent posts', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts?postIds=1234`)
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(true);
          res.body.result.status.should.be.eql(200);
          res.body.result.content.should.be.empty; // eslint-disable-line no-unused-expressions
          res.body.result.metadata.totalCount.should.be.eql(0);
          done();
        });
    });
    it('Get posts count should be greater than 0 for valid posts', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts?postIds=${updPostId}`)
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
          res.body.result.success.should.be.eql(true);
          res.body.result.status.should.be.eql(200);
          res.body.result.content.should.be.a('array');
          res.body.result.content[0].should.have.all.keys('id', 'date', 'updatedDate', 'userId', 'read', 'body', 'rawContent', 'type');
          res.body.result.metadata.totalCount.should.be.eql(1);
          done();
        });
    });
  });
  /*
   * Test GET /topics/:topicId/posts/:postId route
   */
  describe('GET /topics/:topicId/posts/:postId', () => {
    it('Get post should fail when there is no Authorization', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts/${updPostId}`)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(403);
          res.body.result.content.message.should.be.eql('No token provided.');
          done();
        });
    });
    it('Get posts should fail for non existent topics', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get('/v4/topics/12345/posts/1234')
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(404);
          res.body.result.content.message.should.be.eql('Error fetching post');
          done();
        });
    });
    it('Get posts should fail for non existent posts', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts/1234`)
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.success.should.be.eql(false);
          res.body.result.status.should.be.eql(404);
          res.body.result.content.message.should.be.eql('Error fetching post');
          done();
        });
    });
    it('Get post should succeed for valid posts', (done) => {
      chai.request(process.env['tc-message-service-url'])
        .get(`/v4/topics/${topicId}/posts/${updPostId}`)
        .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.all.keys('id', 'version', 'result');
          res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
          res.body.result.success.should.be.eql(true);
          res.body.result.status.should.be.eql(200);
          res.body.result.content.should.have.all.keys('id', 'date', 'updatedDate', 'userId', 'read', 'body', 'rawContent', 'type');
          res.body.result.metadata.totalCount.should.be.eql(1);
          done();
        });
    });
  });
  /*
   * Test POST /topics/:topicId/posts/:postId/edit route
   * Above route is used to update posts
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    describe('POST /topics/:topicId/posts/:postId/edit', () => {
      it('Post update should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts/${updPostId}/edit`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Post update should fail for non existent posts', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts/12345/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ post: 'Testing Post Update' })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(404);
            res.body.result.content.message.should.be.eql('Error updating post');
            done();
          });
      });
      it('Post update should fail when post is not present in body', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts/${updPostId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(400);
            res.body.result.content.message.should.be.eql('Validation error: "post" is required');
            done();
          });
      });
      it('Post update should succeed for valid post', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post(`/v4/topics/${topicId}/posts/${updPostId}/edit`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .send({ post: 'Testing Post Update' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
            res.body.result.success.should.be.eql(true);
            res.body.result.status.should.be.eql(200);
            res.body.result.content.should.have.all.keys('id', 'date', 'updatedDate', 'userId', 'read', 'body', 'type');
            res.body.result.content.body.should.be.eql('<p>Testing Post Update</p>');
            res.body.result.metadata.totalCount.should.be.eql(1);
            done();
          });
      }).timeout(5000);
    });
  }
  /*
   * Test DELETE /topics/:topicId/posts/:postId route
   * Above route is used to delete posts
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    let deletePostId;
    // Creating a different post to test delete end point
    chai.request(process.env['tc-message-service-url'])
      .post(`/v4/topics/${topicId}/posts`)
      .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ post: 'Post to be deleted' })
      .end((err, res) => {
        if (err) {
          winston.error(err);
        } else {
          deletePostId = res.body.result.content.id;
        }
      });
    describe('DELETE /topics/:topicId/posts/:postId', () => {
      it('Post deletion should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .delete(`/v4/topics/${topicId}/posts/${deletePostId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Post deletion should fail for non existent posts', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .delete(`/v4/topics/${topicId}/posts/12345`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(404);
            res.body.result.content.message.should.be.eql('Error deleting post');
            done();
          });
      });
      it('Post deletion should succeed for valid posts', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .delete(`/v4/topics/${topicId}/posts/${deletePostId}`)
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.should.have.all.keys('success', 'status', 'metadata');
            res.body.result.success.should.be.eql(true);
            res.body.result.status.should.be.eql(200);
            res.body.result.metadata.totalCount.should.be.eql(1);
            done();
          });
      });
    });
  }
  /*
   * Test POST /topics/image route
   */
  if (process.env['tc-message-service-read-only'] === 'false') {
    describe('POST /topics/image', () => {
      it('Image Upload should fail when there is no Authorization', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics/image')
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(403);
            res.body.result.content.message.should.be.eql('No token provided.');
            done();
          });
      });
      it('Image upload should fail when no image is uploaded', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics/image')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'multipart/form-data')
          .end((err, res) => {
            res.should.have.status(500);
            res.body.should.have.all.keys('id', 'version', 'result');
            res.body.result.success.should.be.eql(false);
            res.body.result.status.should.be.eql(500);
            res.body.result.content.message.should.be.eql('Multipart: Boundary not found');
            done();
          });
      });
      it('Image upload should succeed when an image is uploaded', (done) => {
        chai.request(process.env['tc-message-service-url'])
          .post('/v4/topics/image')
          .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', fs.readFileSync(path.join(__dirname, '/assets/image.jpeg')), 'image.jpeg')
          .end((err, res) => {
            if (err) {
              done(err);
            } else {
              res.should.have.status(200);
              res.body.should.have.all.keys('id', 'version', 'result');
              res.body.result.should.have.all.keys('success', 'status', 'content', 'metadata');
              res.body.result.success.should.be.eql(true);
              res.body.result.status.should.be.eql(200);
              res.body.result.content.should.have.all.keys('id', 'url', 'original_filename', 'filesize', 'width', 'height', 'extension', 'short_url', 'retain_hours');
              res.body.result.content.original_filename.should.be.eql('image.jpeg');
              res.body.result.metadata.totalCount.should.be.gt(0);
              done();
            }
          });
      }).timeout(20000);
    });
  }
});
