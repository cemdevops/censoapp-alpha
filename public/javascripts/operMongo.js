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

exports.findDistinctField = function (db, field, collection, callback) {
  var coll = db.collection (collection);
  coll.distinct (field, function (err, result) {
    assert.equal (err, null);
    console.log ("Find distinct: " + field + ' em ' + collection);
    callback (result);
  });
}

exports.aggregDocument = function (db, collection, strSource, intYear, strColl, callback) {
  var coll = db.collection (collection);

  coll.aggregate (
    [
      {$match:{source:strSource,year:intYear}},
      {$unwind:"$collection"},
      {$match:{"collection.value":strColl}},
      {$project:{"collection.variable.varCode":1,"collection.variable.label":1}}
    ], function (err, result) {
    assert.equal (err, null);
    console.log ("Aggregation : " + intYear + ' em ' + strColl);
    callback (result);
  });
}

exports.aggregDocumentCollections = function (db, collection, strSource, intYear, strColl, intAvail, callback) {
  var coll = db.collection (collection);

  var strYear = "" + intYear + "";

  coll.aggregate (
    [
      {$match:{source:strSource, year: parseInt (intYear, 10)}},
      {$unwind:"$collection"},
      {$match:{"collection.available":{$ne:intAvail}}},
      {$project:{"collection.value":1,"collection.label":1}}
    ], function (err, result) {
    assert.equal (err, null);
    console.log ("Aggregation : " + intYear + ' em ' + strColl);
    // console.log (result)
    callback (result);
  });
}

/*
exports.schemaGetCollections = function (db, collection, strSource, intYear, strColl, callback) {
  var coll = db.collection (collection);
  console.log ("AGGREG");

  coll.aggregate (
    [
      {$match:{source:strSource,year:intYear}},
      {$unwind:"$collection"},
      {$match:{"collection.value":strColl}},
      {$project:{"collection.variable.varCode":1,"collection.variable.label":1}}
    ], function (err, result) {
    assert.equal (err, null);
    console.log ("Aggregation : " + intYear + ' em ' + strColl);
    callback (result);
  });
}
*/