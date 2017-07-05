var express = require('express');
var router = express.Router();

// Código responsável para renderizar e redirecionar ao 
// arquivo index.ejs

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  	{ 
  		title: 'Plataforma de Consultas de dados censitários' 
  });
});

module.exports = router;
