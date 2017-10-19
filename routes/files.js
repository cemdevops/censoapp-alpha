var cfg = require ('../parameters.js')
var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var mongotocsv = require ('mongo-to-csv');
var assert = require ('assert');
var dboper = require ('../public/javascripts/operMongo');
var utils = require ('../public/javascripts/utils');
var url = require('url');
// Monetdb
var MDB = require('monetdb')();

// GET users listing
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
module.exports = router;

/**
 * geraArq: generate files, acording to selected filters:
 * - Year(s)
 * - Collection(s)
 * - Field(s) filter
 */
router.post('/geraArq', function(req, res, next) {
  console.log("POST files/GeraARQ");   
  var strCollection = "";
  var intAno = 0;
  // array contendo os campos selecionados da coleção   
  var strFields = "[";

  // Consistência. Verifica Ano, Coleção e Variáveis (obrigatórios)
  // Todo: Tipo de arquivo e hierarquia
  // Estado não é obrigatório.
  if ((req.body.ano == null) || (req.body.ano == "")) {
    console.log ("Post/geraArq: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get ano
    intAno = parseInt (req.body.ano);
  }

  if ((req.body.tabela == null) || (req.body.tabela == "")) {
    console.log ("Post/geraArq: tabela não preenchida. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get tabela
    strCollection = req.body.tabela;
  }

  if ((req.body.variaveis == null) || (req.body.variaveis.length < 1)) {
    console.log ("Post/geraArq: variáveis não selecionadas. Vai retornar!");
    res.json ("");
    return;
  } else {
    // Filtra campos.
    for (i = 0; i < req.body.variaveis.length; i++) {
      if (i > 0) {
        strFields += ",";
      }
      strFields += '"' + req.body.variaveis[i] + '"';
    }
    strFields += "]";
  }

  // Seleciona estado, se houver
  var strOptions = '--host ' + cfg.MONGO_IP + ":" + cfg.MONGO_PORT + " --quiet";
  // Filter by state only if there is a selected one
  if ((req.body.estado != null) && (req.body.estado != "")) {
    var varEstado = utils.obtemVarEstado (req.body.ano);

    strOptions += " --query {" + varEstado + ":" + req.body.estado + "}"
    console.log ("Options: " + strOptions);
  }
 
  // get file name, based on date time
  var date = new Date();
  var fileName = strCollection + date.getFullYear() + (date.getMonth()+1) + date.getDate() + 
         date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + ".csv";
  var strOutput = './output/' + fileName;

    mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null);
    console.log ('Connect to mongoDB (Post/geraArq) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    var strQueryYear = "{\"year\":" + intAno + "}";
    var strFieldDbName = "{\"year\":1,\"dbName\":1}";
    // Obtém nome da coleção, de acordo com ano.
    dboper.findDocuments (db, cfg.MONGO_DB_GERAL, JSON.parse (strQueryYear), JSON.parse (strFieldDbName), 0, function (result) {
      if (result.length > 0) {
        console.log ('Post/geraArq. Vai gerar arq no ' + strOptions + "/" + result[0].dbName);
        var strTemp = "{\"database\":\"" + result[0].dbName + "\",\"collection\":\"" + strCollection + "\",\"fields\":" + strFields + ",\"file\":\"" +
                      fileName + "\",\"allValidOptions\":\"" + strOptions + "\"}";
        console.log ("Options: " + strTemp);
        var arrayFields = JSON.parse (strFields);
        var options = {
          database: result[0].dbName,
          collection: strCollection,
          fields: arrayFields,
          output: strOutput,
          allValidOptions: strOptions
        };

        mongotocsv.export (options, function (err, success) {
          console.log ("Err: " + err);
          console.log (success);
          res.json(strTemp)
        });
      } else {
        console.log ("Não encontrou coleção. Retorna");
        res.json("");
      }
    });
  });
});


/**
 * download: download file
 * - Year(s)
 * - Collection(s)
 * - Field(s) filter
 */
router.get('/download', function(req,res){

  //var url_parts = url.parse(req.url,true);
  //console.log("Vai iniciar Download! url_parts:");
  //console.log("Dir name: " + __dirname);
  //console.log(req.query.file);

  if (cfg.DB_SERVER == "internuvem") {
    var file = cfg.MONET_DB_OUTPUT_FOLDER + req.query.file;
  } else {
    var file = "./output/" + req.query.file;
  }
  
  console.log("---------------");
  console.log("--> Vai iniciar Download! File:" + file);
  console.log("---------------");

  res.download (file, "download.csv", function (err) {
      if (err) {
          console.log ("Erro no download");
          console.log (res.headersSent)
      } else {
          console.log ("Download OK!")
          console.log (res.headersSent)
      }
  });
});

// ===============================================================================
// ===============================================================================
/**
 * geraArqMonet: generate files, acording to selected filters, using MonetDB:
 * - Year(s)
 * - Collection(s)
 * - Field(s) filter
 */
// ===============================================================================
// ===============================================================================
router.post('/geraArqMonet', function(req, res, next) {
  console.log("POST files/GeraARQMonet");   
  var strCollection = "";
  var intAno = 0;
  var strDataFormat = "";
  // array contendo os campos selecionados da coleção   
  var strFields = "[";

  // Consistência. Verifica Ano, Coleção e Variáveis (obrigatórios)
  // Todo: Tipo de arquivo e hierarquia
  // Estado não é obrigatório.
  if ((req.body.ano == null) || (req.body.ano == "")) {
    console.log ("Post/geraArq: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get ano
    intAno = parseInt (req.body.ano);
  }

  if ((req.body.tabela == null) || (req.body.tabela == "")) {
    console.log ("Post/geraArq: tabela não preenchida. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get tabela
    strCollection = req.body.tabela;
  }

  if ((req.body.formatoDados == null) || (req.body.formatoDados == "")) {
    console.log ("Post/geraArq: formato dados não especificado. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get tabela
    strDataFormat = req.body.formatoDados;
  }

  if ((req.body.selectedVariables == null) || (req.body.selectedVariables.length < 1)) {
    console.log ("Post/geraArq: variáveis não selecionadas. Vai retornar!");
    res.json ("");
    return;
  } else {
    // Filtra campos.
    for (i = 0; i < req.body.selectedVariables.length; i++) {
      if (i > 0) {
        strFields += ",";
      }
      strFields += '"' + req.body.selectedVariables[i].varCode + '"';
    }
    strFields += "]";
  }
  
  var strQueryMonet = utils.createSQL (req.body, false);
  // get file name, based on date time
  var date = new Date();
  var fileName = strCollection + date.getFullYear() + (date.getMonth()+1) + date.getDate() + 
         date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + ".csv";
  var strOutput = './output/' + fileName;

  var dbAtual = cfg.DB_INIC;

  if (dbAtual == "monet") {
    // Clóvis - monet...
    var strQueryDelimiter = "";
    if (strDataFormat == "csv-commas") {
      strQueryDelimiter += "\',\'";
    } else {
      strQueryDelimiter += "\';\'";
    }
    strQueryDelimiter += ",\'\\n\',\'\' NULL AS \'\'";

//      var strQueryMonet = "COPY " + strSQLSelect + strSQLWhere + " INTO \'" + cfg.MONET_DB_OUTPUT_FOLDER +
//                          fileName + "\' DELIMITERS " + strQueryDelimiter;
      
      // var strQueryMonet = "COPY " + strMonetVars + strSQLSelect + strSQLWhere + " INTO \'" + cfg.MONET_DB_OUTPUT_FOLDER + fileName + "\' DELIMITERS " + strQueryDelimiter;
      var strQueryMonet = "COPY " + strQueryMonet + " INTO \'" + cfg.MONET_DB_OUTPUT_FOLDER + fileName + "\' DELIMITERS " + strQueryDelimiter;
      console.log ("QUERY/MONETDB: SQL ==> " + strQueryMonet);
      var strDBMonet = "censodb";
      
      // create a variable to connect to MonetDB
      var optionsMonet = {
        host  : cfg.MONET_DB_HOST, 
        port  : cfg.MONET_DB_PORT,
        dbname: strDBMonet,
        user  : cfg.MONET_DB_USER,
        password: cfg.MONET_DB_USER,
        language: 'sql',
        prettyResult: true, // the query result will be JSON   
        debug: false,      // Whether or not to log general debug messages
        debugMapi: false,  // Whether or not to show the Mapi messages that
                          // are being sent back and forth between 
                          // the MonetDB NodeJS module and the MonetDB server
        testing: false     // When set True, some additional (undocumented) methods 
                          // will be  exposed, e.g. to simulate socket failures
      };
    
      console.log ("MONET OPTION");
      console.log (optionsMonet);
    
      var conn = new MDB(optionsMonet);
      conn.connect();
      conn.query(strQueryMonet)
      .then(function(result){
        console.log('MONET OK: execution succesful!!');      
        var strTemp = "{\"database\":\"" + strDBMonet + "\",\"resultado\":1,\"collection\":\"" + strCollection + "\",\"fields\":" +
                      strFields + ",\"file\":\"" + fileName + "\",\"allValidOptions\":\"" + optionsMonet + "\"}";
        res.json(strTemp);
        conn.close();
      }, function(err){
        //Handle error here
        console.error("MONET ERRO! ==> " + err);
        var strTemp = "{\"database\":\"" + strDBMonet + "\",\"resultado\":0,\"collection\":\"" + strCollection + "\",\"fields\":" +
                      strFields + ",\"file\":\"" + err + "\",\"allValidOptions\":\"" + optionsMonet + "\"}";
        res.json(strTemp);
        conn.close();
      });
      
  } else {
      mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
      assert.equal (err, null);
      console.log ('Connect to mongoDB (Post/geraArq) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
      var strQueryYear = "{\"year\":" + intAno + "}";
      var strFieldDbName = "{\"year\":1,\"dbName\":1}";
      // Obtém nome da coleção, de acordo com ano.
      dboper.findDocuments (db, cfg.MONGO_DB_GERAL, JSON.parse (strQueryYear), JSON.parse (strFieldDbName), 0, function (result) {
        if (result.length > 0) {
          console.log ('Post/geraArq. Vai gerar arq no ' + strOptions + "/" + result[0].dbName);
          var strTemp = "{\"database\":\"" + result[0].dbName + "\",\"collection\":\"" + strSQLSelect + "\",\"fields\":" + strFields + ",\"file\":\"" +
                        fileName + "\",\"allValidOptions\":\"" + strOptions + "\"}";
          console.log ("Options: " + strTemp);
          var options = {
            database: result[0].dbName,
            collection: strCollection,
            fields: arrayFields,
            output: strOutput,
            allValidOptions: strOptions
          };

          mongotocsv.export (options, function (err, success) {
            console.log ("Err: " + err);
            console.log (success);
            res.json(strTemp)
          });
        } else {
          console.log ("Não encontrou coleção. Retorna");
          res.json("");
        }
      });
    });
  }
});
