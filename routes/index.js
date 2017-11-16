var cfg = require ('../parameters.js');
var express = require('express');
var router = express.Router();
var path = require('path');
var mongoClient = require('mongodb').MongoClient;
var assert = require ('assert');
var dboper = require ('../public/javascripts/operMongo');
var utils = require ('../public/javascripts/utils');
var MDB = require('monetdb')();

// Código responsável para renderizar e redirecionar ao 
// arquivo angularjs index.html
// GET home page
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});
module.exports = router;

/* GET /queryMonet - Monet */
// From "onSubmit": Visualization of file data (10 records)
router.post('/queryMonet', function(req, res, next) {
  console.log ("RUN Post/queryMONET. Parameters:");
  console.log (req.body);

  var strCollection = "";
  var intAno = 0;
  var strFields = "[";
  
  // Consistências. Ano, tabela e variáveis.
  if ((req.body.ano == null) || (req.body.ano == "")) {
    console.log ("Post/query: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get ano
    intAno = parseInt (req.body.ano);
  }

  // Consistências. Ano, tabela e variáveis.
  if ((req.body.tabela == null) || (req.body.tabela == "")) {
    console.log ("Post/query: tabela não preenchida. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get tabela
    strCollection = req.body.tabela;
  }

  /**
   * MODIFICADO CONJUNTO DE VARIÁVEIS
   * AGORA É DE req.body.selectedVariables!!!
   * NECESSÁRIO AINDA OBTER FIELDS CONSIDERANDO OS ANOS!!!
   */
  // Consistências. Ano, tabela e variáveis.
  /*
  if ((req.body.variaveis == null) || (req.body.variaveis.length < 1)) {
    console.log ("Post/query: variáveis não selecionadas. Vai retornar!");
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
  */

  if ((req.body.selectedVariables == null) || (req.body.selectedVariables < 1)) {
    console.log ("Post/query: variáveis não selecionadas. Vai retornar!");
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

  // Clóvis monet ...
  /**
   * ESTÁ OBTENDO OS ANOS DA VARIÁVEL ANO!
   * POR ENQTO ESTÁ PEGANDO O PRIMEIRO ANO APENAS.
   * NECESSÁRIO OBTER SCHEMAS DOS CENSOS A PARTIR DE req.body.selectedVariables!!!
   */
  // Obtém anos dos objetos de variáveis selecionadas

  var strQueryMonet = utils.createSQL (req.body, true);
  strQueryMonet += "LIMIT 10";
  
  // Código ABAIXO Clóvis;

  // var objSchemaMonet = utils.obtemSchemaMonet (req.body.ano);
  // console.log ("objSchemaMonet");
  // console.log (objSchemaMonet);

  // var strSchemaMonet = objSchemaMonet [0].schema;
  // console.log ("strSchemaMonet");
  // console.log (strSchemaMonet);

  // // Obtém anos dos objetos de variáveis selecionadas


  // console.log ("strFields");
  // console.log (strFields);
  
  // var arrayFields = JSON.parse (strFields);
  
  // var strSQLSelect = "SELECT " + arrayFields + " FROM ";
  // var strMonetVars = "";
  // for (i = 0; i < arrayFields.length; i++) {
  //   if (i == 0) {
  //     strMonetVars = "SELECT \'" + arrayFields [i].replace ("VAR","V") + "\'";
  //     strSQLSelect = "SELECT " + arrayFields [i].replace ("VAR","V");
  //   } else {
  //     strMonetVars += ",\'" + arrayFields [i].replace ("VAR","V") + "\'";
  //     strSQLSelect += "," + arrayFields [i].replace ("VAR","V");
  //   }
  // }
  // strMonetVars += " UNION ALL ";
  // strSQLSelect += " FROM ";

  // if (cfg.DB_SERVER == "internuvem") {
  //   strSQLSelect += strSchemaMonet + "." + strCollection;
  // } else {
  //   if (strCollection == "tDom") {
  //     strSQLSelect += "domicilio"
  //   } else {
  //     strSQLSelect += "pessoa"
  //   }
  // }
  // // ...Clóvis monet

  // // Filtro de estado, se houver.
  // var strSQLWhere = "";
  // if ((req.body.estado) && (req.body.estado.length > 0)) {
  //   /**
  //    * TODO: Precisa obter todos os anos!!!
  //    */
  //   var varEstado = utils.obtemVarEstado (req.body.ano[0]);
  //   strSQLWhere = " WHERE (";
  //   for (i = 0; i < req.body.estado.length; i++) {
  //     if (i == 0) {
  //       strSQLWhere += varEstado.replace ("VAR","V") + "=" + JSON.parse (req.body.estado[i])._id;
  //     } else {
  //       strSQLWhere += " OR " + varEstado.replace ("VAR","V") + "=" + JSON.parse (req.body.estado[i])._id;
  //     }
  //     req.body.estado
  //   }
  //   strSQLWhere += ")";

  // }
  
  var dbAtual = cfg.DB_INIC;

  if (dbAtual == "monet") {
    // monet
    // var strQueryMonet = strMonetVars + strSQLSelect + strSQLWhere + " LIMIT 10";
    // var strQueryMonet = strSQLSelect + strSQLWhere + " LIMIT 10";
    console.log ("QUERY/MONETDB: SQL ==> " + strQueryMonet);
    //var strDBMonet = "censodb";

    // create a variable to connect to MonetDB
    var optionsMonet = {
      host  : cfg.MONET_DB_HOST,
      port  : cfg.MONET_DB_PORT,
      dbname: cfg.MONET_DB_NAME,
      user  : cfg.MONET_DB_USER,
      password: cfg.MONET_DB_PASSWD,
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
    .then(function(result) {
      console.log('MONET OK: execution succesful!!');      
      // console.log(result.data);
      res.json(result.data);
      conn.close();
    }, function(err){
      //Handle error here
      console.error("MONET ERRO! ==> " + err);
      res.json("");
      conn.close();
    });

  } else {
    // mongo
    // Consulta nome coleção e consulta definida.
    console.log ("BD: " + cfg.MONGO_DB_APP_CENSO + " | Col: " + strCollection + " | Query: " + strQuery + " | Fields: " + strFields);
    console.log ("Função errada para query mongo!");
  }
});

/* GET /resultadoQuery - Mongo */
// From "onSubmit": Visualization of file data (10 records)
router.post('/queryMongo', function(req, res, next) {
  console.log ("RUN Post/queryMONGO. Parameters:");
  console.log (req.body);

  var strCollection = "";
  var intAno = 0;
  var strFields = "{";
  //var strFields2 = "[";
  
  // Consistências. Ano, tabela e variáveis.
  if ((req.body.ano == null) || (req.body.ano == "")) {
    console.log ("Post/query: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get ano
    intAno = parseInt (req.body.ano);
  }

  // Consistências. Ano, tabela e variáveis.
  if ((req.body.tabela == null) || (req.body.tabela == "")) {
    console.log ("Post/query: tabela não preenchida. Vai retornar!");
    res.json ("");
    return;
  } else {
    // get tabela
    strCollection = req.body.tabela;
  }

  // Consistências. Ano, tabela e variáveis.
  if ((req.body.variaveis == null) || (req.body.variaveis.length < 1)) {
    console.log ("Post/query: variáveis não selecionadas. Vai retornar!");
    res.json ("");
    return;
  } else {
    // Filtra campos.
    for (i = 0; i < req.body.variaveis.length; i++) {
      if (i > 0) {
        strFields += ",";
        //strFields2 += ",";
      }
      strFields += '"' + req.body.variaveis[i] + '":1'
      //strFields2 += '"' + req.body.variaveis[i] + '"';
    }
    strFields += "}";
    //strFields2 += "]";
  }

  // Filtro de estado, se houver.
  strQuery = "{}";
  if (req.body.estado) {
    var varEstado = utils.obtemVarEstado (req.body.ano);
    strQuery = "{\"" + varEstado + "\":" + req.body.estado + "}"
  }
  
  var dbAtual = cfg.DB_INIC;
  if (dbAtual == "monet") {
    // monet
    console.log ("Função errada para consulta monet!");
  } else {
    // mongo
    // Consulta nome coleção e consulta definida.
    console.log ("BD: " + cfg.MONGO_DB_APP_CENSO + " | Col: " + strCollection + " | Query: " + strQuery + " | Fields: " + strFields);
      mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
      assert.equal (err, null);
      console.log ('Connect to mongoDB (Post/query) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
      var strQueryYear = "{\"year\":" + intAno + "}";
      var strFieldDbName = "{\"year\":1,\"dbName\":1}";
      // Obtém nome da coleção, de acordo com ano.
      dboper.findDocuments (db, cfg.MONGO_DB_GERAL, JSON.parse (strQueryYear), JSON.parse (strFieldDbName), 0, function (result) {
        if (result.length > 0) {
          console.log (result[0].dbName);

          mongoClient.connect (cfg.MONGO_URL + "/" + result[0].dbName + cfg.MONGO_URL_AUTH_DB, function (err,db) {
            assert.equal (err, null);
            console.log ('Connect to mongoDB (Post/query) ' + cfg.MONGO_URL + "/" + result[0].dbName);
            // Consulta escolhida.
            dboper.findDocuments (db, strCollection, JSON.parse(strQuery), JSON.parse(strFields), 10, function (result) {
              res.json(result);
              db.close();
            })
          })
        } else {
          console.log ("Não encontrou coleção. Retorna");
          res.json("");
        }
      });
    });

  }
});

// get Censos (Themes)
router.get ('/theme', function(req,res) {
  console.log ("RUN Get/themes. Parameters:");
  console.log (req.query);
  mongoClient.connect (cfg.MONGO_URL + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"Erro-");
    console.log ('Connect to mongoDB (Get/themes) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    var objQuery = {"collection":req.query.tabela,avaiable:1}
    var strFields = "{}";
    dboper.findDocuments (db, cfg.MONGO_DB_THEMES, objQuery, JSON.parse (strFields), 0, function (result) {
 //     console.log ("Themes result: " + result)
      res.json (result);
    })
  });
});

// get Censos (Categories)
router.get ('/categories', function(req,res) {
  console.log ("RUN Get/categories. Parameters:");
  console.log (req.query);
  
  mongoClient.connect (cfg.MONGO_URL + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"Erro-");
    console.log ('Connect to mongoDB (Get/categories) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    dboper.aggregCategory (db, cfg.MONGO_DB_GERAL, req.query.coll, req.query.ano, req.query.var, function (result) {
      //console.log ("Categories result: " + result)
      res.json (result);
    })
  });
});

// get Censos (Auxiliares)
router.get ('/auxiliares', function(req,res) {
  console.log ("RUN Get/auxiliares. Parameters:");
  console.log (req.query);
  
  mongoClient.connect (cfg.MONGO_URL + "/"  + req.query.dbName + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"Erro-");
    console.log ('Connect to mongoDB (Get/auxiliares) ' + cfg.MONGO_URL + "/" + req.query.dbName);
    dboper.findDocuments (db, req.query.coll, {}, {}, 0, function (result) {
      //console.log ("Categories result: " + result)
      res.json (result);
    });
  });
});

// get Censos (Years)
router.get ('/year', function(req,res) {
  console.log ("RUN Get/year");
  mongoClient.connect (cfg.MONGO_URL + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null,"Erro-");
    console.log ('Connect to mongoDB (Get/Year) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    var strFields = "{\"year\":1}";
    dboper.findDocuments (db, cfg.MONGO_DB_GERAL, {available:1}, JSON.parse (strFields), 0, function (result) {
      //console.log ("Years result: " + result)
      res.json (result);
    })
  });
});

// get collections
router.get ('/collection', function(req,res) {
  console.log ("RUN Get/collection. Parameters:");
  console.log (req.query);
  console.log ("RUN Get/collection. Ano [isArray]: " + Array.isArray (req.query.ano));
  console.log ("RUN Get/collection. Ano length: " + req.query.ano.length);
  var numCensos = 1;
  if (req.query.ano == null) {
    console.log ("Get/collection: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  }

  if (Array.isArray (req.query.ano)) {
    console.log ("Mais de um censo:" + req.query.ano);
    numCensos = req.query.ano.length;
  } else {
    console.log ("Apenas um censo:" + req.query.ano);
  }

  mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null);
    console.log ('Connect to mongoDB (Get/Collection) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    // Filtro por ano
    var strQuery = "{\"year\":" + req.query.ano + "}"; //,avaiable:{$ne:0}}";
    if (numCensos == 1) {
      strQuery = "{\"year\":" + req.query.ano + "}"; //,avaiable:{$ne:0}}";
    } else {
      strQuery = "{$or:[";
      for (i = 0; i < numCensos; i++) {
        if (i == 0) {
          strQuery += "{\"year\":" + req.query.ano [i] + "}";
        } else {
          strQuery += ",{\"year\":" + req.query.ano [i] + "}";
        }
      }
      strQuery += "]}";
    }
    console.log ("Get/collection: Query - " + strQuery);
    // Campos: value e label
    var strFields = "{\"collection.value\":1,\"collection.label\":1}";
    var strSource = "censo";
    var resArray = [];
    // Realiza consulta
    dboper.aggregDocumentCollections (db, cfg.MONGO_DB_GERAL, strSource, req.query.ano, "strColl", 0, function (result) {
      console.log ("Get/collection: length - " + result.length);
      if (result.length > 0) {
        // Retornou resultado
        for (i = 0; i < result.length; i++) {
          resArray.push (result[i].collection)
        }
        res.json (resArray);
      } else {
        // Sem resultados. Retorna vazio.
        res.json ("");
      }
    })
  });
});

// get information of UF
router.get ('/ufs', function(req,res) {
  console.log ("RUN Get/ufs. Parameters:");
  console.log (req.query);
  // Consitências.
  if ((req.query.ano == null) || (req.query.ano == "")) {
    console.log ("Get/UFS: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  }

  var numCensos = 1;
  if (Array.isArray (req.query.ano)) {
    console.log ("Get/UFS - Mais de um censo:" + req.query.ano);
    numCensos = req.query.ano.length;
  } else {
    console.log ("Get/UFS - Apenas um censo:" + req.query.ano);
  }

  var strCollection = 'uf';

  mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null);
    console.log ('Connect to mongoDB (Get/UFS - TST) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);


    //var strQuery = "{\"year\":" + req.query.ano + "}";

    var strQuery = "";
    var strAno = "";
    if (numCensos == 1) {
      strAno = req.query.ano;
      strQuery = "{\"year\":" + req.query.ano + "}"; //,avaiable:{$ne:0}}";
    } else {
      /****
       * OBS: fazendo apenas consulta dos primeiro ano!
       * Necessário adaptar para outros anos.
       */
      strAno = req.query.ano[0];
      strQuery = "{\"year\":" + req.query.ano [0] + "}"; //,avaiable:{$ne:0}}";
      /*
      strQuery = "{$or:[";
      for (i = 0; i < numCensos; i++) {
        if (i == 0) {
          strQuery += "{\"year\":" + req.query.ano [i] + "}";
        } else {
          strQuery += ",{\"year\":" + req.query.ano [i] + "}";
        }
      }
      strQuery += "]}";
      */
    }

    var strFields = "{\"year\":1,\"dbName\":1}";
    dboper.findDocuments (db, cfg.MONGO_DB_GERAL, JSON.parse (strQuery), JSON.parse (strFields), 0, function (result) {
      if (result.length > 0) {
        //console.log (result);
        //console.log (result[0].dbName);
        mongoClient.connect (cfg.MONGO_URL + "/" + result[0].dbName + cfg.MONGO_URL_AUTH_DB, function (err,db) {
          assert.equal (err, null);
          console.log ('Connect to mongoDB (Get/ufs) ' + cfg.MONGO_URL + "/" + result[0].dbName);
          dboper.findDocuments (db, strCollection, {}, {}, 0, function (result) {
            // Inclui ano na resposta (todos as UFs)
            var resultComAno = [];
            for (i = 0; i < result.length; i++) {
              objUF = {_id:result[i]._id,State:result[i].State,Ano:strAno}
              resultComAno.push (objUF)
            }

            res.json(resultComAno);
          })
        });
      } else {
        console.log ("result 0");
        res.json("");
      }
    });
  });
});

// get information of variables (of themes)
router.get('/variaveis', function(req,res){
  console.log("RUN Get/variaveis Parameters: ");
  console.log(req.query);

  var strCollection = "";
  var intTema = 100;
  var intAno = 0;

  // Consistências. Ano e tabela.
  if ((req.query.ano == null) || (req.query.ano == "")) {
    console.log ("Get/variáveis: ano não preenchido. Vai retornar!");
    res.json ("");
    return;
  } else {
    intAno = parseInt (req.query.ano);
  }

  if ((req.query.tabela == null) || (req.query.tabela == "")) {
    console.log ("Get/variáveis: tabela não preenchida. Vai retornar!");
    res.json ("");
    return;
  } else {
    strCollection = req.query.tabela;
  }

  if ((req.query.theme == null) || (req.query.theme == "")) {
    console.log ("Get/variáveis: tema não preenchido. Vai retornar!");
    res.json ("");
    return;
  } else {
    intTema = JSON.parse (req.query.theme).themeId;
  }

  console.log ("intTema = " + intTema)
  console.log ("strCollection =" + strCollection)
  mongoClient.connect (cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
    assert.equal (err, null);
    console.log ('Connect to mongoDB (Get/Variáveis) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    dboper.aggregDocument (db, cfg.MONGO_DB_GERAL, "censo", req.query.ano, strCollection, intTema, function (result) {
      console.log ("Tam: " + result.length);
      if (result.length > 0) {
        // Obteve resultado. Retorna.
//        res.json (result[0].collection.variable);
        res.json (result);
      } else {
        // Sem resultados. Retorna vazio.
        res.json ("");
      }
    })
  });
});
