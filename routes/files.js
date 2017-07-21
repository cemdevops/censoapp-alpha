var express = require('express');
var router = express.Router();
//var path = require('path');
//var MDB = require('monetdb')();
//var mongoClient = require('mongodb').MongoClient;
//var assert = require ('assert');
//var dboper = require ('../public/javascripts/operMongo');
var mongotocsv = require ('mongo-to-csv');
//var fs = require('fs');
var url = require('url');

/* GET users listing. */
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
   // array contendo os campos selecionados da coleção   
  var strCollection = "";
  var strCensoDB = "";

  // Select database according to year
  switch (req.body.ano) {
      case "2010": strCensoDB  = "c2010";
                   break;
      case "2000": strCensoDB  = "c2000";
                   break;
      case "1991": strCensoDB  = "c1991";
                   break;
      case "1970": strCensoDB  = "c1970";
                   break;
      default: strCensoDB  = "c2010";
               console.log("Sem ANO");
               break;
  }

  // Set collection(s)
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

  console.log("genFile - collection: " + strCollection + ". Estado: " + req.body.estado);

  // nome do estado
//  var codEstado = req.body.estado;
//  console.log('GeraArq - COD-ESTADO: ' + codEstado);
//  console.log('COD-ESTADO: ' + codEstado);


  // Set selected fields
  var strFields = "[";
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

  var strOptions = '--host 172.16.1.94:27017';
  // Filter by state only if there is a selected one
  if (req.body.estado) {
    var varEstado = "";
    switch (req.body.ano) {
      case "2010": varEstado  = "V0001";
        break;
      case "2000": varEstado  = "V0102";
        break;
      case "1991": varEstado  = "VAR1101";
        break;
      case "1970": varEstado  = "V055";
        break;
      default: varEstado  = "V0001";
        console.log("Sem Estado");
        break;
    }
    strOptions += " --query {" + varEstado + ":" + req.body.estado + "}"
    console.log ("Options: " + strOptions);
  }
 
  // get file name, based on date time
  var date = new Date();
  var fileName = strCollection + date.getFullYear() + (date.getMonth()+1) + date.getDate() + 
         date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + ".csv";
  var strOutput = './output/' + fileName;

  console.log ('Vai gerar arq no ' + strOptions + "/" + strCensoDB);

  var strTemp = "{\"database\":\"" + strCensoDB + "\",\"collection\":\"" + strCollection + "\",\"fields\":" + strFields + ",\"file\":\"" +
                fileName + "\",\"allValidOptions\":\"" + strOptions + "\"}";
  console.log ("Options: " + strTemp);

//  var options = JSON.parse(strTemp);
  var arrayFields = JSON.parse (strFields);
//  console.log ("ARRAY: " + arrayFields);

  var options = {
    database: strCensoDB,
    collection: strCollection,
    fields: arrayFields,
    output: strOutput,
    allValidOptions: strOptions
  };

//  console.log ('OPTIONS: ' + options);

  mongotocsv.export (options, function (err, success) {
    console.log ("Err: " + err);
    console.log (success);
    res.json(strTemp)
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

  var file = "./output/" + req.query.file;
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
