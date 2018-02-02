var cfg = require ('../../parameters.js');
var mongoClient = require('mongodb').MongoClient;
var dboper = require ('./operMongo');
var MDB = require('monetdb')();
var nodemailer = require('nodemailer');
var waterfall = require('async-waterfall');
var fs = require('fs');
var utils = require ('./utils');
var assert = require('assert');
var exec = require('child_process').exec;

var transporter = nodemailer.createTransport(
  {
    "service": "gmail",
    "auth": {
      "user": "cem.devops@gmail.com",
      "pass": "Cem#fflch"
    }
  }
);

// Função que gera arquivos:
// Dados, Metadados
// Envia email.
exports.geraArquivoCsv = function (dadosArq, callback) {

  // **---------------- 20171119
  // ** VERIFICAR: Está abrindo conexão e consultando Mongo novamente
  // ** ==> Aaparentemente não precisa mais. Verificar! Para envio de email?
  // **------------------------------------
  mongoClient.connect (cfg.MONGO_URL_W + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"Erro-");
    console.log ('Connect to mongoDB (NEW/GERA-ARQ-2) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);

    var strQuery = "{\"_id\":\"" + dadosArq._id + "\"}"; //,avaiable:{$ne:0}}";
    console.log (strQuery);
    //var strQuery = {"_id":req.body._id};

    dboper.findDocuments (db, cfg.MONGO_DB_QUEUE, JSON.parse (strQuery), {}, 0, function (result) {
      console.log (result);
      console.log (result.length);

      if (result.length > 0) {

        console.log (result[0].query);
        var strQueryMonet = result[0].query;
        var strUniqueID = result[0]._id;
        var objQryData = result[0].qryData;
        var strCollection = result[0].coll;
        var strSimpleFN = result[0].simpleFn;

        console.log ("UNIQUE ID: ", strUniqueID);
        
        var optionsMonet = {
          host  : cfg.MONET_DB_HOST, 
          port  : cfg.MONET_DB_PORT,
          dbname: cfg.MONET_DB_NAME,
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
        console.log ("Monet Option: ", optionsMonet);
      
        var conn = new MDB(optionsMonet);
        conn.connect();
        conn.query(strQueryMonet)
        .then(function(result){
          console.log('MONET OK: execution succesful!!');      
          conn.close();
          
          // Gera arquivo de metadados:
          
          geraArquivoMetadados (objQryData, strCollection, strSimpleFN, function (strRes) {
            console.log ("08 - Terminou de gerar arquivo metadados 0:", strRes);
        
            //var fileName = "POST files/GeraARQMonet-2";
            //var strTemp = "{\"resultado\":1,\"file\":\"" + fileName + "\"}"

            console.log ("Vai enviar e-mail!!", dadosArq.email, "\n");
            
            var strHTML = utils.getEmailHTMLBody (strUniqueID, objQryData);
            
            var mailOptions = {
              from: 'cem.devops@gmail.com',
              to: dadosArq.email,
              subject: '[CEM] Não responda - download de arquivo ',
              text: 'Arquivo disponível para download.',
              html: strHTML
            }
  
            transporter.sendMail(mailOptions, function(error, info) {
              if (error) {
                  console.log("ERRO NO EMAIL ===> ", error);
              } else {
                  console.log("Envio E-mail (" + dadosArq.email + ") OK: " + info.response);
                  newDate = new Date();
                  objUpdate = {status:3, dt3:newDate};
                  dboper.updateDocument (db, {_id:dadosArq._id}, objUpdate, cfg.MONGO_DB_QUEUE, function (resUpdEmail) {
                    console.log("Atualização BD envio email OK: ", resUpdEmail.result);
                  });
              }
            });
            // Envio email...
  
            console.log ("CALLBACK: ", "{\"resultado\":1,\"file\":\"" + dadosArq.filename + "\"}")
            callback ("{\"resultado\":1,\"file\":\"" + dadosArq.filename + "\"}");
            
          });

          

          // Envio email...

          /*
          console.log ("Vai enviar e-mail!!", dadosArq.email, "\n");

          var strHTML = utils.getEmailHTMLBody (strUniqueID, objQryData);
          */

          /*
          var strHTML = "<h1>CEM - Plataforma de extração de dados censitários</h1>" +
                        "<p>Arquivo disponível.</p>" +
                        "<p>Para realizar o download, clicar no link abaixo</p>" +
                        "<br>" +
                        "<div>Arquivo: <a href='http://" + cfg.APP_IP + ":" + cfg.APP_PORT +
                        "/files/download?file=" + strUniqueID +
                        "'> Download </a></div>";
*/
          //console.log (strHTML);

          /*
          var mailOptions = {
            from: 'cem.devops@gmail.com',
            to: dadosArq.email,
            subject: '[CEM] Não responda - download de arquivo ',
            text: 'Arquivo disponível para download.',
            html: strHTML
          }

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log("ERRO NO EMAIL ===> ", error);
            } else {
                console.log("Envio E-mail (" + dadosArq.email + ") OK: " + info.response);
            }
          });
          // Envio email...

          console.log ("CALLBACK: ", "{\"resultado\":1,\"file\":\"" + dadosArq.filename + "\"}")
          callback ("{\"resultado\":1,\"file\":\"" + dadosArq.filename + "\"}");
          */
          
        }, function(err){
          //Handle error here
          console.error("MONET ERRO! ==> " + err);
          //var strTemp = "{\"database\":\"" + cfg.MONET_DB_NAME + "\",\"resultado\":1,\"collection\":\"" + strCollection + "\",\"fields\":" +
          //              strFields + ",\"file\":\"" + err + "\",\"allValidOptions\":\"" + optionsMonet + "\"}";
          //res.json(strTemp);
          conn.close();
          callback ("{\"resultado\":0,\"file\":\"" + dadosArq.filename + "\"}");
        });
          
      }
      
    });
  });
}

function consultaMD (arrVar1, callback) {
  var strLine = "";
  var strFile = "";
  var fileArray = [];

  console.log ("Início consultaMD-Vai chamar aggregate");

  mongoClient.connect (cfg.MONGO_URL_W + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db1) {
    assert.equal (err, null,"==>Erro-" + err);
    var coll = db1.collection (cfg.MONGO_DB_GERAL);
    var strDesc = "";
    var strPop = "";
    var strObs = "";
    var strCat = "";
    
    coll.aggregate (arrVar1, function (err, result) {
      assert.equal (err, null);

      for (i = 0; i < result.length; i++) {

        if (result[i].collection.variable.description) {
          strDesc = result[i].collection.variable.description;
        }
        if (result[i].collection.variable.popToApply) {
          strPop = result[i].collection.variable.popToApply;
        }
        if (result[i].collection.variable.obs) {
          strObs = result[i].collection.variable.obs;
          strObs = strObs.replace(/"/g, "\"\"");
          strObs = strObs.replace(/•/g, "-");
        }

        strLine += result[i].year + '\t' +
                  result[i].collection.variable.varCode + '\t' + //
                  result[i].collection.variable.label + '\t' + //
                  "\"" + strDesc.replace(/"/g, "\"\"") + "\"" + '\t' + //
                  "\"" + strPop.replace(/"/g, "\"\"") + "\"" + '\t' + //
                  "\"" + strObs + "\"" + '\t';// + //
                  //result[i].collection.variable.themeId + '\t'; // + // ?
        switch (result[i].collection.variable.catType) {
          case 0:
          case 5:
          case 6:
//            strFile = result[i].collection.variable.category[0].label + "_" + result[i].year + ".xls";
            strFile = "Censo " + result[i].year + " - Variável " + result[i].collection.variable.varCode +
                      " - Categorias e Alternativas.xls";
            fileArray.push (strFile);
            //strLine += result[i].collection.variable.catType + " - ***VER***" + '\t';
            strLine += "Consultar arquivo auxiliar " + strFile + "\n";
            break;
          case 1:
          case 2: // Campos com categorias
            var categorias = result[i].collection.variable.category;
            strLine += "\"";
            for (idxCat = 0; idxCat < categorias.length; idxCat++) {
              if (idxCat > 0) {
                strLine += "\n";
              }
              if (categorias [idxCat].label) {
                strCat = "" + categorias [idxCat].label;
              } else {
                console.log ("Não encontrou Label: ", result[i].collection.variable.varCode);
                strCat = "";
              }
              strLine += categorias [idxCat].value + "- " + strCat.replace(/"/g, "\"\"");
            }
            strLine += "\"\n";
            break;
          case 3:
          case 4:
            //strLine += "4 - ***VER***" + '\t';
            strLine += "Campo numérico, sem categorias\n";
            break;
          default:
            //strLine += result[i].collection.variable.catType + "-DEF - ***VER***" + '\t';
            strLine += "DEFAULT\n";
            break;
        }
      }
      db1.close ();
      callback (strLine, fileArray);
    });

  });

  console.log ("Fim consultaMD-Depois de aggregate");
}

geraArquivoMetadados = function (objMD, tCol, fileName, callback) {
  console.log ("GeraArqMD: Início");
  
  var allArrayVar = [];
  var taskArray = [];
  
  // Consulta objMD para cada ano
  for (i = 0; i < objMD.length; i++) {
    // Captura variáveis do ano
    varSel = objMD [i].var;
    var arrayVar = [];
    // Para cada variável do ano
    for (j = 0; j < varSel.length; j++) {
      console.log ("GeraArqMD: Vai pegar dados de ", objMD [i].year," - ", objMD [i].var [j]);
      var objVar = {"collection.variable.varCode":objMD [i].var [j]};

      arrayVar.push (objVar);
    }
    // Cria array de consulta aggregate para um ano
    var arrayQuery = [];
    arrayQuery = [
      {$match: {year:objMD [i].year}},
      {$unwind:"$collection"},
      {$match:{"collection.value":tCol}},
      {$unwind:"$collection.variable"},
      {$match:{$or: arrayVar}},
      {$project:{
        year:1,
        "collection.value":1,
        "collection.variable.varCode":1,
        "collection.variable.dataType":1,
        "collection.variable.label":1,
        "collection.variable.description":1,
        "collection.variable.popToApply":1,
        "collection.variable.obs":1,
        "collection.variable.themeId":1,
        "collection.variable.catType":1,
        "collection.variable.category.value":1,
        "collection.variable.category.label":1,
        }
      }
    ];

    allArrayVar.push (arrayQuery);
  } // Consulta para cada ano ... for (i = 0; i < objMD.length; i++)

  // Preenche vetor com tasks do waterfall
  for (intContTasks = 0; intContTasks < allArrayVar.length; intContTasks++) {
    if (intContTasks == 0) {
      //console.log ("Vai incluir - ", allArrayVar.length, "-", allArrayVar [intContTasks])
      taskArray.push (function(callback) {
        consultaMD (allArrayVar [0], function (result, fileArray) {
          //console.log ("fileArray: ", fileArray);
          callback(null, result, 1, fileArray);
        });
      });
    } else {
      //console.log ("Vai incluir - ", allArrayVar.length, "-", allArrayVar [intContTasks])
      taskArray.push (function(arg1, arg2, arg3, callback) {
        consultaMD (allArrayVar [arg2], function (result, fileArray) {
          //console.log ("fileArray: ", fileArray);
          callback(null, arg1 + result, arg2 + 1, fileArray.concat(arg3));
        })
      });
    }
  }

  waterfall (taskArray, function (err, resultFile, arg2, arg3) {
    // Terminou execução Waterfall para captura dados arquivo
    // Cria arquivos
    resultFile = "Ano\tVariável\tLabel\tDescrição\tPopulação a qual se aplica\tObservação\tCategorias\n"
                  + resultFile;
//    var strMetadataFileName = cfg.MONET_DB_OUTPUT_FOLDER + fileName + ".xls";
    var strMetadataFileName = cfg.MONET_DB_OUTPUT_FOLDER + fileName + " - Dicionário das variáveis selecionadas.xls";
    fs.writeFile(strMetadataFileName, resultFile, {encoding: "latin1"}, function(err) {
      if (err) {
        console.log ("Erro na geração de arquivo: ", err)
        return console.log(err);
      }
      console.log("Gerou arquivo: ", strMetadataFileName);
      // Cria arquivo compactado com arquivos de metadados.
//      var strCmd = "zip -j " + cfg.MONET_DB_OUTPUT_FOLDER + fileName + ".zip " + strMetadataFileName;
      var strCmd = "zip -j \"" + cfg.MONET_DB_OUTPUT_FOLDER + fileName + " - Dicionário das variáveis selecionadas.zip\" \"" + strMetadataFileName + "\"";
      for (intAuxFiles = 0; intAuxFiles < arg3.length; intAuxFiles++) {
        strFile = cfg.APP_AUX_FILES_FOLDER + arg3 [intAuxFiles];
        try {
          if (fs.statSync(strFile).isFile()) {
            strCmd += " \"" + strFile + "\"";
          }
        } catch (err) {
          console.log ("Arquivo não existe: ", strFile);
        }
      }
      
      exec(strCmd, function(error, stdout, stderr) {
        if (error) {
          console.log ("Error: ", error, "strErr: ", stderr)
        }

        callback ("FIM-WF");
      });

    }); // Fim - writeFile
  }); // Waterfall

} // exports.geraArquivoMetadados


  