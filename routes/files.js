var cfg = require ('../parameters.js')
var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var mongotocsv = require ('mongo-to-csv');
var assert = require ('assert');
var dboper = require ('../public/javascripts/operMongo');
var utils = require ('../public/javascripts/utils');
var url = require('url');

// Clóvis - monet...
var MDB = require('monetdb')();
// ...Clóvis - monet

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
    /*
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
    */
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

  var url_parts = url.parse(req.url,true);
  console.log("Vai iniciar Download! url_parts:");
  console.log("Dir name: " + __dirname);
  console.log(req.query.file);
  //var jsonf = JSON.stringify(req);

  // Teste de geração de arquivo
  /*
  fs.writeFile("./output/test.txt", req, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
  */

  if (cfg.DB_SERVER == "internuvem") {
    var file = cfg.MONET_DB_OUTPUT_FOLDER + req.query.file;
  } else {
    var file = "./output/" + req.query.file;
  }
  
//  console.log("File (1): " + file);
//  file = '/home/clovis/censomnpmexpcsv/output/teste.csv';

  console.log("File: " + file);

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

  console.log ("strFields: " + strFields);
  var arrayFields = JSON.parse (strFields);

  var strSchemaMonet = utils.obtemSchemaMonet (req.body.ano);
  /*
  switch (req.body.ano) {
    case "2010": strSchemaMonet = "c2010";
                 break;
    case "2000": strSchemaMonet = "c2000";
                 break;
    case "1991": strSchemaMonet = "c1991";
                 break;
    case "1980": strSchemaMonet = "c1980";
                 break;
    case "1970": strSchemaMonet = "c1970";
                 break;
    default: strSchemaMonet = "c2010";
             console.log("Sem schema!");
             break;
  }
  */
  console.log ("arrayFields: " + arrayFields.length + ". fields: " + arrayFields);
  var strSQLSelect = "SELECT " + arrayFields + " FROM ";
  var strMonetVars = "";
  for (i = 0; i < arrayFields.length; i++) {
    if (i == 0) {
      strMonetVars = "SELECT " + arrayFields [i].replace ("VAR","V");
      strSQLSelect = "SELECT " + arrayFields [i].replace ("VAR","V");
    } else {
      strMonetVars += "," + arrayFields [i].replace ("VAR","V");
      strSQLSelect += "," + arrayFields [i].replace ("VAR","V");
    }
  }
  strMonetVars += " FROM "; //c2010.tPesHeader UNION ALL ";
  strSQLSelect += " FROM ";

  if (cfg.DB_SERVER == "internuvem") {
    strSQLSelect += strSchemaMonet + "." + strCollection;
    strMonetVars += strSchemaMonet + "." + strCollection + "Header UNION ALL ";
  } else {
    if (strCollection == "tDom") {
      strSQLSelect += "domicilio"
    } else {
      strSQLSelect += "pessoa"
    }
  }
  
  // Seleciona estado, se houver
  var strSQLWhere = "";
  var strOptions = '--host ' + cfg.MONGO_IP + ":" + cfg.MONGO_PORT + " --quiet";
  // Filter by state only if there is a selected one
  if ((req.body.estado != null) && (req.body.estado != "")) {
    var varEstado = utils.obtemVarEstado (req.body.ano);
    /*
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
    */
    strOptions += " --query {" + varEstado + ":" + req.body.estado + "}"
    strSQLWhere = " WHERE " + varEstado.replace ("VAR","V") + "=" + req.body.estado;
    console.log ("Options: " + strOptions);
  }
 
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
      var strQueryMonet = "COPY " + strMonetVars + strSQLSelect + strSQLWhere + " INTO \'" + cfg.MONET_DB_OUTPUT_FOLDER +
                          fileName + "\' DELIMITERS " + strQueryDelimiter;
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
        var strTemp = "{\"database\":\"" + strDBMonet + "\",\"collection\":\"" + strCollection + "\",\"fields\":" + strFields + ",\"file\":\"" + fileName + "\",\"allValidOptions\":\"" + strOptions + "\"}";
        res.json(strTemp);
        conn.close();
      }, function(err){
        //Handle error here
        console.error("MONET ERRO! ==> " + err);
        res.json("");
        conn.close();
      });
      
    /*
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
    */
      // ...Clóvis - monet.
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
