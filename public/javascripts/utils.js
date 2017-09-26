 //MongoClient = require('mongodb').MongoClient,
var assert = require('assert');

// Função para retornar variávei Estado de acordo com o censo.
exports.obtemVarEstado =  function (strEstado) {
//  function obtemVarEstado (strEstado) {
  var varEstado = "";
  switch (strEstado) {
    case "2010": varEstado  = "V0001";
      break;
    case "2000": varEstado  = "V0102";
      break;
    case "1991": varEstado  = "V1101";
      break;
    case "1980": varEstado  = "V2";
      break;
    case "1970": varEstado  = "V055";
      break;
    default: varEstado  = "V0001";
      console.log("Sem Estado");
      break;
  }
  return varEstado;
}

// Função para retornar schema censo monet de acordo com o censo.
exports.obtemSchemaMonet =  function (strCenso) {
//  function obtemSchemaMonet (strCenso) {
  var varSchema = "";
  switch (strCenso) {
    case "2010": varSchema = "c2010";
                 break;
    case "2000": varSchema = "c2000";
                 break;
    case "1991": varSchema = "c1991";
                 break;
    case "1980": varSchema = "c1980";
                 break;
    case "1970": varSchema = "c1970";
                 break;
    default: varSchema = "c2010";
             console.log("Sem schema!");
             break;
  }
  return varSchema;
}
