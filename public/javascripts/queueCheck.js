var cfg = require ('../../parameters.js');
var mongoClient = require('mongodb').MongoClient;
var dboper = require ('./operMongo');
var fileGen = require ('./fileGen');
var assert = require('assert');

// Função para retornar variávei Estado de acordo com o censo.
exports.queueCheck =  function queueCheck() {
  intContador = 0;
  intMaxConcurrentProc = cfg.MAX_CONCURRENT_PROCCESS;
  intExecutedProcess = 0;
  intLoopMaxProcess = 0;

  console.log ("==> Início execução fila de geração de arquivos.")
  try {
    checkQueue();
  } catch (exception) {
    console.log ("ERRO==>", exception);
    setTimeout(checkQueue, cfg.QUEUE_CHECK_INTERVAL_SECONDS*1000);
  }

  // Primeira execução. Verifica se existem pendências.
  // - Processos que estavam em execução
  // - 

  function checkQueue () {
    intContador++;
    if ((intContador % 100) == 0) {
      console.log ("Sem atividade geração por: ", (intContador*cfg.QUEUE_CHECK_INTERVAL_SECONDS)/60, " minutos\n\n");
      //intContador = 0;
    }

    /**
     * Início da checagem da fila de execução (a cada intervalo, em segundos, de cfg.QUEUE_CHECK_INTERVAL_SECONDS)
    */

    // Verificar se já tem processos em execução.
    // console.log ("intExecutedProcess:", intExecutedProcess);
    if (intExecutedProcess < intMaxConcurrentProc) {

      // Não tem proc. max executando
      intLoopMaxProcess = 0;
      if (intExecutedProcess > 0) {
        // Tem processo rodando
        intContador = 0;
      }

      intExecutedProcess++;

      // Verifica se tem mais algum na fila para entrar
      mongoClient.connect (cfg.MONGO_URL_W + "/"  + cfg.MONGO_DB_APP_CENSO + cfg.MONGO_URL_AUTH_DB, function (err,db) {
        assert.equal (err, null,"==>Erro-" + err);
        //console.log ('Connect to mongoDB (NEW/GERA-ARQ-2) ' + cfg.MONGO_URL + "/" + cfg.MONGO_DB_APP_CENSO);
    
//        var strQuery = "{\"status\":0}";
        var objQuery = {status:0};
        //console.log (strQuery);
    
        // Verifica se tem arquivos para serem gerados.
        /**
         * TODO: fazer consulta para ordenar de acordo com prioridade e ordem
         */
        dboper.findDocuments (db, cfg.MONGO_DB_QUEUE, objQuery, {}, 0, function (resFind) {
          //console.log (resFind);
          //console.log (resFind.length);
          if (resFind.length > 0) {
            intContador = 0;
            // Tem arquivos para gerar.
            console.log ("Tem query para processar: ", resFind.length);
            for (i = 0; i < resFind.length; i++) {
              console.log ("Envia arquivo: ", resFind[i].file);
            }

            //console.log (resFind[0]);

            var newDate = new Date();

            var objUpdate = {status:1, dt1:newDate};
            // Muda status para gerando
            dboper.updateDocument (db, {_id:resFind[0]._id}, objUpdate, cfg.MONGO_DB_QUEUE, function (resUpdtGerando) {
              var strAux = "Data hora da geração: " + newDate.getFullYear() + (newDate.getMonth()+1) + newDate.getDate() + 
                      " " + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds() + ":" + newDate.getMilliseconds();
              console.log ("GERANDO (" + strAux + "): ", resUpdtGerando.result);
              
              // Gera arquivo e envia e-mail
              fileGen.geraArquivoCsv (resFind[0], function (strRes) {
                console.log ("Chamou geraArqCsv() - 0");
                // Muda status para gerado.
                newDate = new Date();
                objUpdate = {status:2, dt2:newDate};
                dboper.updateDocument (db, {_id:resFind[0]._id}, objUpdate, cfg.MONGO_DB_QUEUE, function (resUpdtGerado) {
                  strAux = "Data hora da geração: " + newDate.getFullYear() + (newDate.getMonth()+1) + newDate.getDate() + 
                          " " + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds() + ":" + newDate.getMilliseconds();
                  console.log ("GERADO (" + strAux + "): ", resUpdtGerando.result);
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
          } else {
            //console.log ("Sem arqs para gerar");
            intExecutedProcess = intExecutedProcess - 1;
            db.close();
          }

        });

      });
          
    } else {
      // Tem MAX_PROCESS processando ou mais
      intContador = 0;
      intLoopMaxProcess++;
      if ((intLoopMaxProcess % 100) == 0) {
        console.log ("Processos máximos executando há: ", (intLoopMaxProcess*cfg.QUEUE_CHECK_INTERVAL_SECONDS)/60, " minutos\n\n");
      }
    }

    setTimeout(checkQueue, cfg.QUEUE_CHECK_INTERVAL_SECONDS*1000);
  }
}

