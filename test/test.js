
var request = require('supertest');
var should = require('should');

var app = require('./app.js');

var config = require('./config.js');
var adapter = require('lockit-' + config.db + '-adapter')(config);

// add a dummy user to db
before(function(done) {
  adapter.save('john', 'john@email.com', 'password', function(err, user) {
    if (err) console.log(err);
    done();
  });
});

describe('delete account', function() {
  
  describe('GET /delete-account', function() {

    it('should render the default route', function(done) {

      request(app)
        .get('/delete-account')
        .end(function(err, res) {
          res.statusCode.should.equal(200);
          res.text.should.include('Once you delete your account, there is no going back');
          res.text.should.include('<title>Delete account</title>');
          done();
        });

    });
    
  });
  
  describe('POST /delete-account', function() {
    
    it('should show an error message when an input field is empty', function(done) {

      request(app)
        .post('/delete-account')
        .send({username: '', phrase: 'lorem', password: 'secret'})
        .end(function(error, res) {
          res.statusCode.should.equal(403);
          res.text.should.include('All fields are required');
          done();
        });
      
    });

    it('should show an error message when phrase is incorrect', function(done) {

      request(app)
        .post('/delete-account')
        .send({username: 'john', phrase: 'please do not delete my account forever', password: 'secret'})
        .end(function(error, res) {
          res.statusCode.should.equal(403);
          res.text.should.include('Phrase doesn\'t match');
          done();
        });

    });

    it('should show an error message when session doesn\'t match username', function(done) {

      request(app)
        .post('/delete-account')
        .send({username: 'jack', phrase: 'please delete my account forever', password: 'secret'})
        .end(function(error, res) {
          res.statusCode.should.equal(403);
          res.text.should.include('You can only delete your own account. Please enter your username');
          done();
        });

    });
    
    it('should show an error message when password is incorrect', function(done) {

      request(app)
        .post('/delete-account')
        .send({username: 'john', phrase: 'please delete my account forever', password: 'secret'})
        .end(function(error, res) {
          res.statusCode.should.equal(403);
          res.text.should.include('Password is wrong');
          done();
        });
      
    });
    
    it('should delete a user from db when everything is fine', function(done) {

      request(app)
        .post('/delete-account')
        .send({username: 'john', phrase: 'please delete my account forever', password: 'password'})
        .end(function(error, res) {
          res.statusCode.should.equal(200);
          res.text.should.include('<title>Account deleted</title>');
          res.text.should.include('Your accout has been deleted.');
          done();
        });
      
    });
    
  });
  
});