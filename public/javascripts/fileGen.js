var cfg = require ('../../parameters.js');
var mongoClient = require('mongodb').MongoClient;
var dboper = require ('./operMongo');
var MDB = require('monetdb')();
var nodemailer = require('nodemailer');
var assert = require('assert');

var transporter = nodemailer.createTransport(
  {
    "service": "gmail",
    "auth": {
      "user": "cem.devops@gmail.com",
      "pass": "Cem#fflch"
    }
  }
);


// Função para retornar variávei Estado de acordo com o censo.
exports.geraArquivoCsv = function (dadosArq, callback) {

  mongoClient.connect (cfg.MONGO_URL + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"Erro-");
    console.log ('Connect to mongoDB (NEW/GERA-ARQ-2) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);

    var strQuery = "{\"_id\":\"" + dadosArq._id + "\"}"; //,avaiable:{$ne:0}}";
    console.log (strQuery);
    //var strQuery = {"_id":req.body._id};

    dboper.findDocuments (db, cfg.MONGO_DB_QUEUE, JSON.parse (strQuery), {}, 0, function (result) {
      console.log (result);
      console.log (result.length);

      

      if (result.length > 0) {
        var strDBMonet = "censodb";

        console.log (result[0].query);
        var strQueryMonet = result[0].query;
        var strUniqueID = result[0]._id;
        console.log ("UNIQUE ID: ", strUniqueID);
        
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
        //var strDBMonet = "dbMonet";
        //var strCollection = "coll";
        //var strFields = "strFi";
        //fileName
      
        var conn = new MDB(optionsMonet);
        conn.connect();
        conn.query(strQueryMonet)
        .then(function(result){
          console.log('MONET OK: execution succesful!!');      
          //var strTemp = "{\"database\":\"" + strDBMonet + "\",\"resultado\":1,\"collection\":\"" + strCollection + "\",\"fields\":" +
          //              strFields + ",\"file\":\"" + fileName + "\",\"allValidOptions\":\"" + optionsMonet + "\"}";
          //res.json(strTemp);
          conn.close();
          

          // Clóvis - Teste e-mail...
          console.log ("Vai enviar e-mail!!", dadosArq.email, "\n");
          /*
          try {
          } catch (exception) {
            console.log ("Exception ==> ", exception);
          }
          */
          var strHTML = "<h1>CEM - Plataforma de extração de dados censitários</h1>" +
                        "<p>Arquivo disponível.</p>" +
                        "<p>Para realizar o download, clicar no link abaixo</p>" +
                        "<br>" +
                        "<div>Arquivo: <a href='http://" + cfg.APP_IP + ":" + cfg.APP_PORT +
                        "/files/download?file=" + strUniqueID +
                        "'> Download </a></div>";

          //console.log (strHTML);

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
          // Clóvis - Teste e-mail...

          console.log ("CALLBACK: ", "{\"resultado\":1,\"file\":\"" + dadosArq.filename + "\"}")
          callback ("{\"resultado\":1,\"file\":\"" + dadosArq.filename + "\"}");
          
        }, function(err){
          //Handle error here
          console.error("MONET ERRO! ==> " + err);
          //var strTemp = "{\"database\":\"" + strDBMonet + "\",\"resultado\":1,\"collection\":\"" + strCollection + "\",\"fields\":" +
          //              strFields + ",\"file\":\"" + err + "\",\"allValidOptions\":\"" + optionsMonet + "\"}";
          //res.json(strTemp);
          conn.close();
          callback ("{\"resultado\":0,\"file\":\"" + dadosArq.filename + "\"}");
        });
          
      }
      
    });
  });
}
