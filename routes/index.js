var express = require('express');
var router = express.Router();
var path = require('path');
//var MDB = require('monetdb')();
var mongoClient = require('mongodb').MongoClient;
var assert = require ('assert');
var dboper = require ('../public/javascripts/operMongo');
var mongotocsv = require ('mongo-to-csv');
var fs = require('fs');
var url = require('url');

// create a variable to connect to Mongo
// var urlAppMongo = 'mongodb://localhost:27017/appMongo';

// db c2010 possui uma quantidade menor de registros
var urlAppMongo = 'mongodb://172.16.1.94:27017/c2010';

// Código responsável para renderizar e redirecionar ao 
// arquivo angularjs index.html

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});
module.exports = router;

/* GET /resultadoQuery */
router.post('/query', function(req, res, next) {
   console.log("POST/QUERY");   

  var strCollection = 'uf';

  switch (req.body.tabela) {
    case "emigracao": strCollection  = 'tEmi';
      console.log(req.body.tabela);
      break;
    case "domicilio": strCollection  = 'tDom';
      console.log("Tabela: " + req.body.tabela);
      break;
    case "pessoa": strCollection  = 'tPes';
      console.log(req.body.tabela);
      break;
    case "mortalidade": strCollection  = 'tMor';
      console.log(req.body.tabela);
      break;
    default: strCollection  = 'default';
      console.log("Sem tab");
      break;
  }

   console.log('nomeColecao: ' + strCollection);

   // nome do estado
   var codEstado = req.body.estado;

   var strFields = "{";

   console.log('COD-ESTADO: ' + codEstado);
   if (req.body.variaveis) {
     console.log ('Variável existe')
     console.log ('TAM VARIAVEIS: ' + req.body.variaveis.length);
     console.log ('VARIAVEIS: ' + req.body.variaveis);
     for (i = 0; i < req.body.variaveis.length; i++) {
       if (i > 0) {
         strFields += ",";
       }
       strFields += '"' + req.body.variaveis[i] + '":1'
     }
   } else {
     console.log ('Variável NÃO existe')
   }
   strFields += "}";
   console.log ('Projection: ' + strFields);


  mongoClient.connect (urlAppMongo, function (err,db) {
    assert.equal (err, null);
    // urlAppMongo = 'mongodb://localhost:27017/appMongo';
    dboper.findDocuments (db, strCollection, {}, JSON.parse(strFields), 10, function (result) {
      console.log("Post /query OK!");
      res.json(result);
      db.close();
    })
  })
});

router.post('/geraArq', function(req, res, next) {
  console.log("POST/GeraARQ");   
   // array contendo os campos selecionados da coleção   
  var strCollection = 'uf';

  switch (req.body.tabela) {
    case "emigracao": strCollection  = 'tEmi';
      break;
    case "domicilio": strCollection  = 'tDom';
      break;
    case "pessoa": strCollection  = 'tPes';
      break;
    case "mortalidade": strCollection  = 'tMor';
      break;
    default: strCollection  = 'default';
      break;
  }

   console.log('geraArq - nomeColecao: ' + strCollection);

   // nome do estado
   var codEstado = req.body.estado;

   console.log('GeraArq - COD-ESTADO: ' + codEstado);

   var strFields = "[";

   console.log('COD-ESTADO: ' + codEstado);
   if (req.body.variaveis) {
     for (i = 0; i < req.body.variaveis.length; i++) {
       if (i > 0) {
         strFields += ",";
       }
       strFields += '"' + req.body.variaveis[i] + '"';
     }
   } else {
     console.log ('Variável NÃO existe')
   }
   strFields += "]";
   console.log ('Projection: ' + strFields);


  var strOutput = './output/teste.csv';
  var strOptions = '--host 172.16.1.94:27017';
  var strDBS = "c2010";

  console.log ('Vai gerar arq no ' + strOptions + "/" + strDBS);

  var strTemp = "{\"database\":\"c2010\",\"collection\":\"" + strCollection + "\",\"fields\":" + strFields + ",\"output\":\"" +
                strOutput + "\",\"allValidOptions\":\"" + strOptions + "\"}";
  console.log ("Options: " + strTemp);

//  var options = JSON.parse(strTemp);
  var arrayFields = JSON.parse (strFields);
//  console.log ("ARRAY: " + arrayFields);

  var options = {
    database: strDBS,
    collection: strCollection,
    fields: arrayFields,
    output: strOutput,
    allValidOptions: strOptions
  };

  console.log ('OPTIONS: ' + options);


  mongotocsv.export (options, function (err, success) {
    console.log ("Err: " + err);
    console.log (success);
    res.json(strTemp)
  });
});


// Selecionar os campos escolhidos 
function selectFields(camposSelecionados){
   var query;
   query = 'SELECT * ';//+ camposSelecionados;
   return query;
}

// Selecionar o modelo correspondente a uma colecao 
function selectTable(nomeColecao){
   var query;
   query = ' FROM '+ nomeColecao;
   return query;
}

/*// Filter a query by 'where'
function filterByWhere(limit){
   var query;
   query = '   WHERE '+ limit;
   return query;
}*/

// Selecionar o modelo correspondente a uma colecao 
function defineLimit(limit){
   var query;
   query = ' LIMIT '+ limit;
   return query;
}

router.get('/data', function(req,res){
  console.log ('Run router.get /data!');
  alert ('Run router.get /data!');
  /**
   var conn = new MDB(options);
   
   // Connect using promises
   conn.connect(); // Alias conn.open()
   
   // Note that when you have issued a query with parameters, 
   // this will under the hood be executed in two steps 
   // (one prepare step and one execution step). 
   conn.prepare('SELECT id,v0001,v0002,v0011 FROM emigracao WHERE v0001=? LIMIT ?')
   .then(function(prepResult){                  
      prepResult.exec(['11',5])
      .then(function(result) {
         res.json(result.data);   
         // do something with the result
         console.log('connection succesful!!');     
         console.log(result.data);
            
      }, function(err){
         console.error(err);
      });
      // We are donde, release it (and do not wait for it, 
      // release method does not return a promise)
      prepResult.release();
      // Close the connection after `release()` executed
      conn.close();

   }, function(err){
      //Handle error here
      console.error(err);
   });       
**/
});

// get the information of Auxiliaries tables
router.get ('/ufs', function(req,res) {

  var strCollection = 'uf';
  //appReso.getVariavel(codVar)
  mongoClient.connect (urlAppMongo, function (err,db) {
    assert.equal (err, null);
    console.log ('Connect to mongoDB (Get/ufs) ' + urlAppMongo);
    dboper.findDocuments (db, strCollection, {}, {}, 0, function (result) {
      res.json(result);
    })
  })
});

// get the information of variables
router.get('/variaveis', function(req,res){

  console.log("GET/VARIAVEIS Parameters:");
  console.log(req.query);

  var strCollection = "";

  switch (req.query.tabela) {
    case "emigracao": strCollection  = 'schemaEmi';
      console.log(req.query.tabela);
      break;
    case "domicilio": strCollection  = 'schemaDom';
      console.log("Tabela: " + req.query.tabela);
      break;
    case "pessoa": strCollection  = 'schemaPes';
      console.log(req.query.tabela);
      break;
    case "mortalidade": strCollection  = 'schemaMor';
      console.log(req.query.tabela);
      break;
    default: strCollection  = 'default';
      console.log("Sem tab");
      break;
  }

  mongoClient.connect (urlAppMongo, function (err,db) {
    assert.equal (err, null);
    strFiltro = {showInPage:{$gt:0}};
    console.log ('Connect to mongoDB (Get/Variaveis) ' + urlAppMongo + ". TAB=" + strCollection);
    dboper.findDocuments (db, strCollection, strFiltro, {}, 0, function (result) {
      res.json(result);
    })
  })
});

router.get('/download', function(req,res){

  var url_parts = url.parse(req.url,true);
  console.log(url_parts.query);
  //var jsonf = JSON.stringify(req);

  // Teste de geração de arquivo
  fs.writeFile("/home/clovis/censomnpmexpcsv/output/test.txt", req, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });

  var file = __dirname + 'output/teste.csv';
  file = '/home/clovis/censomnpmexpcsv/output/teste.csv';

  console.log("File: " + file);

  res.download (file);
});
