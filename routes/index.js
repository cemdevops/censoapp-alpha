var express = require('express');
var router = express.Router();
var path = require('path');
//var MDB = require('monetdb')();
var mongoClient = require('mongodb').MongoClient;
var assert = require ('assert');
var dboper = require ('../public/javascripts/operMongo');
//var mongotocsv = require ('mongo-to-csv');
//var fs = require('fs');
//var url = require('url');

// create a variable to connect to Mongo
// db c2010 possui uma quantidade menor de registros
//var urlAppMongo = 'mongodb://172.16.1.94:27017/c2010';
var urlMongo = 'mongodb://172.16.1.94:27017';
var strAppMongo = "appMongo";
var strCensoDB = "c2010";

// Código responsável para renderizar e redirecionar ao 
// arquivo angularjs index.html

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});
module.exports = router;

/* GET /resultadoQuery */
// From "onSubmit": Visualization of file data (10 records)
router.post('/query', function(req, res, next) {
   console.log("POST/QUERY: ");

  var strCollection = "";
  console.log("Tabela: " + req.body.tabela);

  switch (req.body.tabela) {
    case "emigracao": strCollection  = 'tEmi';
      break;
    case "domicilio": strCollection  = 'tDom';
      break;
    case "pessoa": strCollection  = 'tPes';
      break;
    case "mortalidade": strCollection  = 'tMor';
      break;
    case "geral": strCollection  = 'tGer';
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
//     console.log ('Variável existe')
//     console.log ('TAM VARIAVEIS: ' + req.body.variaveis.length);
//     console.log ('VARIAVEIS: ' + req.body.variaveis);
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

   // Por enquanto hard coded sobre 1991, 2000 e 2010. Alterar para genérico.
   if (req.body.ano == 2000) {
     strCensoDB = "c2000";
   } else if (req.body.ano == 2010) {
     strCensoDB = "c2010";
   } else if (req.body.ano == 1991) {
     strCensoDB = "c1991";
   } else if (req.body.ano == 1980) {
     strCensoDB = "c1980";
   } else if (req.body.ano == 1970) {
     strCensoDB = "c1970";
   } else {
     strCensoDB = "censo"
   }
   console.log ('CENSO: ' + req.body.ano + "-" + strCensoDB);

   strQuery = "{}";

  if (req.body.estado) {
    var varEstado = "";
    switch (req.body.ano) {
      case "2010": varEstado  = "V0001";
        break;
      case "2000": varEstado  = "V0102";
        break;
      case "1991": varEstado  = "VAR1101";
        break;
      case "1980": varEstado  = "V2";
        break;
      case "1970": varEstado  = "V055";
        break;
      default: varEstado  = "V0001";
        console.log("Sem Estado");
        break;
    }
    strQuery = "{\"" + varEstado + "\":" + req.body.estado + "}"
  }

  console.log ("BD: " + strCensoDB + " | Col: " + strCollection + " | Query: " + strQuery + " | Fields: " + strFields);
  mongoClient.connect (urlMongo + "/" + strCensoDB, function (err,db) {
    assert.equal (err, null);
    // urlAppMongo = 'mongodb://localhost:27017/appMongo';
    dboper.findDocuments (db, strCollection, JSON.parse(strQuery), JSON.parse(strFields), 10, function (result) {
      console.log("Post /query OK!");
      res.json(result);
      db.close();
    })
  })
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


// get the information of UF Collections
router.get ('/ufs', function(req,res) {

  console.log ("GET/UFS ANO=: " + req.query.ano)
  var strCollection = 'uf';
  // Mudar para appMongo, qdo carregar UFs.
  if (req.query.ano == 2010) {
    strCensoDB = "c2010";
  } else if (req.query.ano == 2000) {
    strCensoDB = "c2010";
  } else if (req.query.ano == 1991) {
    strCensoDB = "c1991";
  } else if (req.query.ano == 1980) {
    strCensoDB = "c1980";
  } else if (req.query.ano == 1970) {
    strCensoDB = "c1970";
  } else {
    strCensoDB = "";
  }

  mongoClient.connect (urlMongo + "/" + strCensoDB, function (err,db) {
    assert.equal (err, null);
    console.log ('Connect to mongoDB (Get/ufs) ' + urlMongo + "/" + strCensoDB);
    dboper.findDocuments (db, strCollection, {}, {}, 0, function (result) {
      res.json(result);
    })
  })
});

// get information of variables
router.get('/variaveis', function(req,res){

  console.log("GET/VARIAVEIS Parameters:");
  console.log(req.query);
  console.log("GET/VARIAVEIS Parameters TABELA=:" + req.query.tabela);

  var strCollection = "";

  console.log("Tabela: " + req.query.tabela);
  switch (req.query.tabela) {
    case "emigracao": strCollection  = 'schemaEmi';
      break;
    case "domicilio": strCollection  = 'schemaDom';
      break;
    case "pessoa": strCollection  = 'schemaPes';
      break;
    case "mortalidade": strCollection  = 'schemaMor';
      break;
    case "geral": strCollection  = 'schemaGer';
      break;
    default: strCollection  = 'default';
      console.log("Sem tab");
      break;
  }

  // Tem que fazer a consulta pq sem tabela, vai preencher com vaxzio, apagando o que existe
  strCollection = strCollection + req.query.ano;
  //strCollection = strCollection + ano;
  console.log ("strCollection =" + strCollection)

  mongoClient.connect (urlMongo + "/" + strAppMongo, function (err,db) {
    assert.equal (err, null);
    strFiltro = {showInPage:{$gt:0}};
    console.log ('Connect to mongoDB (Get/Variaveis) ' + urlMongo + "/" + strAppMongo + ". TAB=" + strCollection);
    dboper.findDocuments (db, strCollection, strFiltro, {}, 0, function (result) {
      res.json(result);
    })
  })
});
