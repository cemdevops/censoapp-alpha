var cfg = require ('../parameters.js')
var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var mongotocsv = require ('mongo-to-csv');
var assert = require ('assert');
var dboper = require ('../public/javascripts/operMongo');
var utils = require ('../public/javascripts/utils');
var fileGen = require ('../public/javascripts/fileGen');
var url = require('url');
// Monetdb
var MDB = require('monetdb')();

var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');
var uniqid = require('uniqid');

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
         date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + ".csv.gz";
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

  var arquivo = "";
  var strUniqueId = req.query.file;
  console.log ("UniqueId:", strUniqueId);

  // Verifica se é código válido.
  console.log ("Início DL - vai conectar mongo")
  mongoClient.connect (cfg.MONGO_URL_W + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"==>Erro-" + err);
    console.log ('Connect to mongoDB (DOWNLOAD) ' + cfg.MONGO_URL_W + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB);

    // Cria ID único
    var strQuery = "{\"_id\":" + req.query.file + "}";
    var objQuery = {_id: req.query.file};
    console.log ("strQuery: ",objQuery)
    
//    dboper.findDocuments (db, cfg.MONGO_DB_QUEUE, JSON.parse (strQuery), {}, 0, function (resFind) {
    dboper.findDocuments (db, cfg.MONGO_DB_QUEUE, objQuery, {}, 0, function (resFind) {
      if (resFind.length > 0) {
        // Encontrou o registro. Verifica se arquivo é válido.
        console.log ("Encontrou registro: ", resFind [0]);
        arquivo = resFind [0].file;
        
        if (fs.existsSync(arquivo)) { 
          console.log("--Arquivo existe-------------");
          console.log("--> Vai iniciar Download! File:" + arquivo);
          console.log("---------------");
          
          res.download (arquivo, function (err) {
              if (err) {
                  console.log ("Erro no download:", err);
                  db.close();
                  console.log (res.headersSent)
              } else {
                  console.log ("Download OK!");
                  console.log (res.headersSent);
                  // Atualiza BD com status Download OK!
                  var newDate = new Date();
                  var objUpdate = {status:4, dt4:newDate};
                  dboper.updateDocument (db, objQuery,objUpdate,cfg.MONGO_DB_QUEUE, function (resUpdtDlOk) {
                    console.log ("Download OK!: ", resUpdtDlOk.result);
                    db.close();
                  });
              }
          });
          
        }
        else {
          console.log ("Arquivo ", arquivo, " NÃO Existe mais. EXPIRADO!!")
          db.close();
          console.log (res.headersSent)
      //    res.send("<h1>Welcome</h1><p>That was easy!</p><p>That was easy!</p><br><div>Baixar Arq <a href='http://localhost:3000'> Texto </a></div>");
          res.redirect("/");
      //    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
        }

/*
        // Muda status para Download OK
        dboper.updateDocument (db, {_id:resFind[0]._id},{status:3},cfg.MONGO_DB_QUEUE, function (resUpdtGerando) {
          console.log ("Status Download andamento: ", resUpdtGerando.result);
          
          // Gera arquivo e envia e-mail
          fileGen.geraArquivoCsv (resFind[0], function (strRes) {
            console.log ("Chamou geraArqCsv() - 0");
            // Muda status para gerado.
            dboper.updateDocument (db, {_id:resFind[0]._id},{status:2},cfg.MONGO_DB_QUEUE, function (resUpdtGerado) {
              console.log ("GERADO!: ", resUpdtGerado.result);
              intExecutedProcess = intExecutedProcess - 1;
              //res.json(strRes);
              var date = resFind[0].dt0;
              var strAux = "Data hora da geração: " + date.getFullYear() + (date.getMonth()+1) + date.getDate() + 
                    date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + ".csv";
              console.log (strAux);
              db.close();
            });
            
          });
        });

*/

      } else {
        db.close();
        console.log ("Registro inválido!!");
        res.redirect("/");
      }

    });

    /*
    console.log ("Insert doc: ", strDoc)
    dboper.insertDocument (db, strDoc, strColIns, function (result) {
      //console.log ("Categories result: " + result)
      console.log (result);
      //res.json (result);
    });
    */

  });
  

  /*
  if (cfg.DB_SERVER == "internuvem") {
    var file = cfg.MONET_DB_OUTPUT_FOLDER + req.query.file;
  } else {
    var file = "./output/" + req.query.file;
  }
  

  if (fs.existsSync(file)) { 
    console.log("--Arquivo existe-------------");
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
  }
  else {
    console.log ("Arquivo ", file, " NÃO Existe!!")
    console.log (res.headersSent)
//    res.send("<h1>Welcome</h1><p>That was easy!</p><p>That was easy!</p><br><div>Baixar Arq <a href='http://localhost:3000'> Texto </a></div>");
    res.redirect("/");
//    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
  }
  */

  /*
  fs.existsSync(file, function(exists) {
    if (exists) {
      console.log ("Arquivo existe 1!")
    } else {
      console.log ("Arquivo NÃO Existe 1!!")
    }
  });
  */

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

  if ((req.body.email == null) || (req.body.email == "")) {
    console.log ("Post/geraArq: email inválido. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get tabela
    strEmail = req.body.email;
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

    var strQueryMonet = "COPY " + strQueryMonet + " INTO \'" + cfg.MONET_DB_OUTPUT_FOLDER + fileName + "\' DELIMITERS " + strQueryDelimiter;
    console.log ("QUERY/MONETDB: SQL ==> " + strQueryMonet);
    var strDBMonet = "censodb";
    
    // Insere geração na FILA para execução
    
    // 1 - pode verificar complexidade para inserir prioridade.

    // Precisa de:
    // - Unique ID
    // - Select
    // - Nome d arquivo
    // - Email destino
    // - Hora início
    // - Estado
    // - Prioridade (?)
    mongoClient.connect (cfg.MONGO_URL_W + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
      assert.equal (err, null,"Erro-" + err);
      console.log ('Connect to mongoDB (Input-Queue) ' + cfg.MONGO_URL_W + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB);

      // Cria ID único
      var strUniqueId = uniqid ();
      strDoc = {
        "_id": strUniqueId,
        "query": strQueryMonet,
        "filename":fileName,
        "file": cfg.MONET_DB_OUTPUT_FOLDER + fileName,
        "email": strEmail,
        "dt0": new Date(), // data criação
        "dt1": "", // data início geração
        "dt2": null, // data fim geração
        "dt3": null, // data envio e-mail
        "dt4": null, // data download
        "status": 0, // 0-Enfileirado, 1-Gerando, 2-Gerado, 3-Email enviado, 4-Download OK, 9-Erro
        "priority": 1
      };

      console.log ("Insert doc: ", strDoc)
      dboper.insertDocument (db, strDoc, cfg.MONGO_DB_QUEUE, function (result) {
        //console.log ("Categories result: " + result)
        console.log (result);
        strTemp = "{\"resultado\":1,\"file\":\"" + fileName + "\"}"
        console.log ("strTEMP: ", strTemp);
        db.close ();
        res.json(strTemp);
        //res.json (result);
      })
    });

    console.log ("Depois de Connect to mongoDB (Input-Queue)")
    /*
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
    var strTemp = "{\"database\":\"" + strDBMonet + "\",\"resultado\":1,\"collection\":\"" + strCollection + "\",\"fields\":" +
                  strFields + ",\"file\":\"" + fileName + "\",\"allValidOptions\":\"" + optionsMonet + "\"}";
    strTemp = "{resultado:1,file:" + fileName + "}"
    console.log ("strTEMP: ", strTemp);
    res.json(strTemp);
    */

  } else {
      mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
      assert.equal (err, null);
      console.log ('Connect to mongoDB (Post/geraArq) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
      var strQueryYear = "{\"year\":" + intAno + "}";
      var strFieldDbName = "{\"year\":1,\"dbName\":1}";
      var strOutput = './output/' + fileName;
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

router.post('/geraArqMonet-2', function(req, res, next) {
  console.log("POST files/GeraARQMonet-2");

  console.log (req.body.uniqueID);

  fileGen.geraArquivoCsv (req.body.uniqueID, function (strRes) {
    console.log ("Chamou geraArqCsv() - 0")
    res.json(strRes);
  });

  console.log ("Chamou geraArqCsv() - 1")
});
