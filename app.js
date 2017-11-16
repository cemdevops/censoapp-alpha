// load mongoose package
//var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('console-stamp')(console, 'dd/mm/yy HH:MM:ss');
var cfg = require ('./parameters.js');
var queueCheckModule = require ('./public/javascripts/queueCheck');

// Direciona logs para arquivos, se necessário
if (cfg.APP_MODE == "prod") {
  // Se app em produção, cria arquivos de log para saída padrão.
  var date = new Date();
  var fs = require('fs');
  // Nome do arquivo: appCenso-<aaaa><mm><dd><hh><MM>.log
  var LogFileName = __dirname + '/log/appCenso-' + date.getFullYear() + (date.getMonth()+1) + date.getDate() +
                    date.getHours() + date.getMinutes() + '.log';
  var errFileName = __dirname + '/log/appCensoErr-' + date.getFullYear() + (date.getMonth()+1) + date.getDate() +
                    date.getHours() + date.getMinutes() + '.log';
  if (!fs.existsSync(__dirname + '/log')) {
    console.log ("Diretório de log criado!")
      fs.mkdirSync(__dirname + '/log');
  }

  var log_file = fs.createWriteStream(LogFileName, { flags: 'w' });
  var err_file = fs.createWriteStream(errFileName, { flags: 'w' });
  console.log ("LOG File: " + LogFileName);
  console.log ("ERR File: " + errFileName);
  process.stdout.write = log_file.write.bind(log_file);
  process.stderr.write = err_file.write.bind(err_file);
  //process.stderr.pipe(access);
}

var index = require('./routes/index');
var users = require('./routes/users');
var files = require('./routes/files');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
 limit: '50mb',
 extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/files', files);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("[ERRO!]: " + err.status + " - " + err.message)
  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.send(404, 'Erro ao acessar página!! Página inexistente!!');
  //res.status(err.status || 500).send(err.message + '<br>' + 'Erro ao acessar página!! Página inexistente!!');
});

//queueCheckModule.queueCheck ();
setTimeout(queueCheckModule.queueCheck, 5 * 1000);

module.exports = app;
