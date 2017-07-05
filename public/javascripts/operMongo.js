 //MongoClient = require('mongodb').MongoClient,
var assert = require('assert');

// connection URL
exports.insertDocument =  function (db, document, collection, callback) {
  var coll = db.collection (collection);
  coll.insert (document, function (err, result) {
    assert.equal (err, null);
    console.log ("Inserted " + result.result.n + " documents into " + collection);
    callback (result);
  });
}

exports.findAllDocuments = function (db, collection, callback) {
  var coll = db.collection (collection);
  coll.find ({}).toArray (function (err, docs) {
    assert.equal (err, null);
    callback (docs);
  });
}

exports.removeDocument = function (db, document, collection, callback) {
  var coll = db.collection (collection);
  coll.deleteOne (document, function (err, result) {
    assert.equal (err, null);
    console.log ("Removed document " + document);
    callback (result);
  });
}

exports.updateDocument = function (db, document, update, collection, callback) {
  var coll = db.collection (collection);
  coll.updateOne (document, {$set: update}, null, function (err, result) {
    assert.equal (err, null);
    console.log ("Updated document with " + update);
    callback (result);
  });
}

exports.findDocuments = function (db, strCollection, conditions, fields, intLimit, callback) {
 // console.log ("Collection: " + strCollection);
  var coll = db.collection (strCollection);
  coll.find (conditions, fields).limit(intLimit).toArray (function (err, docs) {
    assert.equal (err, null);
    callback (docs);
  });
}
