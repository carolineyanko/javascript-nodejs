var app = require('app');
var mongoose = require('lib/mongoose');

var dataUtil = require('lib/dataUtil');

describe('User', function() {

  var User = require('../../../models/user');

  before(function* () {
    yield dataUtil.createEmptyDb;
  });

  it('given bad email errors on save', function*() {
    var user = new User({
      email: "BAD",
      displayName: "John",
      password: "123"
    });

    user.persist()(function(err) {
      err.name.should.equal('ValidationError');
      err.errors.email.value.should.equal(user.get('email'));
    });

  });

  // does not require password, because social login does not use it
  it('requires email & displayName', function() {
    [
      {
        email: "my@gmail.com"
      },
      {
        displayName: "John"
      }
    ].map(function(data) {
        var user = new User(data);
        // cannot use yield* because inside map
        user.persist()(function(err) {
          err.name.should.equal('ValidationError');
        });
      });

  });

  it('autogenerates salt and hash', function* () {

    var user = new User({
      email: "a@b.ru",
      displayName: "John",
      password: "pass"
    });

    user.get('salt').should.not.be.empty;
    user.get('passwordHash').should.not.be.empty;
    user.checkPassword("pass").should.be.true;

  });

  it('requires unique email', function* () {

    var data = {
      displayName: "nonunique",
      email: "nonunique@b.ru",
      password: "pass"
    };

    yield new User(data).persist();
    try {
      yield new User(data).persist();
      throw new Error("Same email is saved twice!");
    } catch(err) {
      err.code.should.equal(11000); // unique index is checked by mongo
    }

  });
});
