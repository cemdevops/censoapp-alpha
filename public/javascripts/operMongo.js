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
    //console.log (docs);
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

exports.aggregDocument = function (db, collection, strSource, intYear, strColl, intTheme, callback) {
  var coll = db.collection (collection);
  var strQueryColl = "{\"collection.value\":\"" + strColl + "\"}";
  var strQueryTheme = "";
  if (intTheme == 100) {
    strQueryTheme = "{}"
  } else {
    strQueryTheme = "{\"collection.variable.themeId\":" + intTheme + "}"
  }

  var strYear = "[";
  var strAux = "[";
  var arrayYear = [];
  
  if (Array.isArray (intYear)) {
    for (i = 0; i < intYear.length; i++) {
      arrayYear.push (parseInt (intYear[i], 10));
      if (i == 0) {
        strAux += intYear [i];
      } else {
        strAux += "," + intYear [i];
      }
    }
  } else {
    arrayYear.push (parseInt (intYear, 10));
    strAux += intYear;
  }
  strYear += "]";
  strAux += "]";
  
console.log ("ArrayYear: " + arrayYear);
console.log ("strAux: " + JSON.parse (strAux));

  
console.log (strQueryTheme);
console.log ("JSON.parse(strQueryColl)");
console.log (JSON.parse(strQueryTheme));
  coll.aggregate (
    [
      {$match:{source:strSource,year:{$in:arrayYear}}},
      {$unwind:"$collection"},
      //      {$match:{"collection.value":strColl}},
      {$match:JSON.parse(strQueryColl)},
      {$unwind:"$collection.variable"},
      {$match:JSON.parse(strQueryTheme)},
      // {$project:{"collection.variable.varCode":1,"collection.variable.label":1,"collection.variable.year":"$year","collection.variable.varCode":1,"collection.variable.disabled":""}}
      {$project:{"collection.variable.varCode":1,
                 "collection.variable.label":1,
                 "collection.variable.year":"$year",
                 //"collection.variable.varCode":1,
                 "collection.variable.description":1,
                 "collection.variable.popToApply":1,
                 "collection.variable.obs":1,
                 "collection.variable.themeId":1,
                 "collection.variable.catType":1,
                 "collection.variable.disabled":""}
      }
    ], function (err, result) {
    assert.equal (err, null);
//    console.log (result);
//    console.log (result[0].collection.variable);
    console.log ("Aggregation : " + intYear + ' em ' + strColl);
    callback (result);
  });
}

exports.aggregDocumentCollections = function (db, collection, strSource, intYear, strColl, intAvail, callback) {
  var coll = db.collection (collection);

  console.log("year: " + intYear);
 // var arrayYear = "[" + intYear + "]";
  var arrayYear = [];
  var strYear = "[";
  var strAux = "[";
  
  if (Array.isArray (intYear)) {
    for (i = 0; i < intYear.length; i++) {
      arrayYear.push (parseInt (intYear[i], 10));
      if (i == 0) {
        strAux += intYear [i];
      } else {
        strAux += "," + intYear [i];
      }
    }
  } else {
    arrayYear.push (parseInt (intYear, 10));
    strAux += intYear;
  }
  strYear += "]";
  strAux += "]";
  
  console.log ("ArrayYear: " + arrayYear);
  console.log ("strAux: " + strAux);
  
  var strYear = "";
  
  //var strYear = "" + intYear + "";
  strAux = "[2010,2000]"
  console.log ("strAux: " + strAux);
  
  coll.aggregate (
    [
      // {$match:{source:strSource, year: parseInt (intYear, 10)}},
      // {$match:{source:strSource, year:{$in:arrayYear}}},
      {$match:{source:strSource, year:{$in:JSON.parse (strAux)}}},
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

exports.aggregCategory = function (db, collection, strColl, intYear, strVar, callback) {

  var coll = db.collection (collection);
  console.log("year: " + intYear);

  coll.aggregate (
    [
      {$match: {year:parseInt (intYear, 10)}},
      {$unwind:"$collection"},
      {$match:{"collection.value":strColl}},
      {$unwind:"$collection.variable"},
      {$match:{$or: [
          {"collection.variable.varCode":strVar},
      ]}
      },
      {$project:{
        year:1,
        dbName:1,
        "collection.value":1,
        "collection.variable.varCode":1,
        "collection.variable.dataType":1,
        "collection.variable.label":1,
        "collection.variable.catType":1,
        "collection.variable.category.value":1,
        "collection.variable.category.label":1
      }
      }
      // {$match:{source:strSource, year: parseInt (intYear, 10)}},
      // {$match:{source:strSource, year:{$in:arrayYear}}},

      //{$match:{source:strSource, year:{$in:JSON.parse (strAux)}}},
      //{$unwind:"$collection"},
      //{$match:{"collection.available":{$ne:intAvail}}},
      //{$project:{"collection.value":1,"collection.label":1}}
    ], function (err, result) {
        assert.equal (err, null);
        console.log ("Aggregation : " + intYear + ' em ' + strColl);
        // console.log (result)
        callback (result);
    }
  );
  /*
  db.tGeral.aggregate([
    {$match: {year:2010}},
    {$unwind:"$collection"},
    {$match:{"collection.value":"tPes"}},
    {$unwind:"$collection.variable"},
    {$match:{$or: [
         {"collection.variable.varCode":"V0001"},
         {"collection.variable.varCode":"V0002"},
         {"collection.variable.varCode":"V1001"},
     ]}
    },
    {$project:{
      year:1,
      "collection.value":1,
      "collection.variable.varCode":1,
      "collection.variable.dataType":1,
      "collection.variable.label":1,
      "collection.variable.catType":1,
      "collection.variable.category.value":1,
      "collection.variable.category.label":1
     }
    }
  ]).pretty()
  */
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