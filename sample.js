var assert = require('assert');
var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

console.log('\n===========');
console.log('    mongoose version: %s', mongoose.version);
console.log('========\n\n');

var dbname = 'testing_populateAdInfinitum';
console.log('dbname: %s', dbname);
mongoose.connect('localhost', dbname);
mongoose.connection.on('error', function () {
  console.error('connection error', arguments);
});

var phone = new Schema({
  name: String
});
var Phone = mongoose.model('Phone', phone);

var user = new Schema({
  name: String,
  phone: {
    type: Schema.ObjectId,
    ref: 'Phone'
  }
});
var User = mongoose.model('User', user);

var blogpost = Schema({
  title: String,
  tags: [String],
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});
var BlogPost = mongoose.model('BlogPost', blogpost);

var phoneIds = [new ObjectId, new ObjectId];
var createPhones = function (callback) {
    var phones = [];

    phones.push({
      _id: phoneIds[0],
      name: 'iPhone 5'
    });
    phones.push({
      _id: phoneIds[1],
      name: 'GALAXY S'
    });

    Phone.create(phones, function (err, docs) {
      assert.ifError(err);
      callback(null, phoneIds);
    });
  };

var createUsers = function (phoneIds, callback) {
    var userIds = [new ObjectId, new ObjectId];
    var users = [];

    users.push({
      _id: userIds[0],
      name: 'mary',
      phone: phoneIds[0]
    });
    users.push({
      _id: userIds[1],
      name: 'bob',
      phone: phoneIds[1]
    });

    User.create(users, function (err, docs) {
      assert.ifError(err);
      callback(null, userIds);
    });
  };

var createBlogPosts = function (userIds, callback) {
    var blogposts = [];

    blogposts.push({
      title: 'blog 0',
      tags: ['fun', 'cool'],
      author: userIds[0]
    });
    blogposts.push({
      title: 'blog 1',
      tags: ['cool'],
      author: userIds[1]
    });

    BlogPost.create(blogposts, function (err, docs) {
      assert.ifError(err);
      callback(null);
    });
  };

var findFunBlogPosts = function (callback) {
    BlogPost.find({
      tags: 'fun'
    }).lean().populate('author').exec(function (err, docs) {
      assert.ifError(err);

      var authors = docs.map(function(doc) {
        return doc.author;
      });

      User.populate(authors, {
        path: 'phone',
        select: 'name'
      }, callback);
    });
  };

mongoose.connection.on('open', function () {
  async.waterfall([
  createPhones, createUsers, createBlogPosts, findFunBlogPosts], function (err, result) {
    if(err) {
      console.error(err.stack);
    }
    console.log(result);
    mongoose.connection.db.dropDatabase(function () {
      mongoose.connection.close();
    });
  });
});
