 //MongoClient = require('mongodb').MongoClient,
var assert = require('assert');
var cfg = require ('../../parameters.js');

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

console.log ("vai obter schema: ", strCenso);
  var varSchema = [];
  console.log ("tamanho: ", strCenso.length);
  
  for (i = 0; i < strCenso.length; i++) {
    console.log("i=" + i + " str=" + strCenso [i]);
    switch (strCenso [i]) {
      case "2010": varSchema.push ({ano:strCenso [i],schema:"c2010"});
      console.log(strCenso [i]);
      break;
      case "2000": varSchema.push ({ano:strCenso [i],schema:"c2000"});
      console.log(strCenso [i]);
      break;
      case "1991": varSchema.push ({ano:strCenso [i],schema:"c1991"});
      console.log(strCenso [i]);
      break;
      case "1980": varSchema.push ({ano:strCenso [i],schema:"c1980"});
      console.log(strCenso [i]);
      break;
      case "1970": varSchema.push ({ano:strCenso [i],schema:"c1970"});
      console.log(strCenso [i]);
      break;
      case "1960": varSchema.push ({ano:strCenso [i],schema:"c1960"});
      console.log(strCenso [i]);
      break;
      default: varSchema.push ({ano:strCenso [i],schema:"c2010"});
      console.log(strCenso [i]);
      console.log("Sem schema!");
               break;
    }
  }
  return varSchema;
}

exports.createSQL = function (objreq, sview) {

  /*
  console.log("##########################################################");
  console.log("Exibe o parâmetro passado:" + JSON.stringify(objreq) + "\n\n\n");
  console.log("Formatos dados: " + objreq.formatosdados);
  console.log("Tabela: " + objreq.tabela);
  console.log("Theme: " + objreq.theme +"\n");
  console.log("Estado: " + objreq.estado +"\n");
  console.log("Variaveis: " + objreq.variaveis + "\n");
  console.log("Selected Variables: " + JSON.stringify(objreq.selectedVariables) +"\n");
  console.log("##########################################################");
  */

  var strCollection = objreq.tabela;
  //console.log("Tabela: " + strCollection);
  //var intAno = parseInt (objreq.ano);
  
  var svarCode;
  var arrayAnos = [];
  //var arrayUF = [{_id:11 , year: 2010, state: "RO"},{_id: 27, year: 2010, state: "CE"},{_id:35 ,year: 2000, state: "SP"}];
  var arrayUF = objreq.estado;
  //var arrayVar = [{year: 2010, varCode: "V0001"}, {year: 2010, varCode: "V0300"}, {year: 2010, varCode: "V1001"}, {year: 2000, varCode: "V0102"}, {year: 2000, varCode: "V0300"}, {year: 2000, varCode: "V1002"}];
  var arrayVar = [];
  arrayVar = objreq.selectedVariables;
  var arraysql = [];

  console.log("Inicia o processamento dos censos selecionados");
    // Create the header
  var shearder = "SELECT ";
  var spref;
  for (i = 0; i < arrayVar.length; i++) {
    console.log("Process variable: ", arrayVar[i].year, arrayVar[i].varCode);
    var selem = arrayVar[i];
    svarCode = selem.varCode.replace("VAR","V");

    switch (selem.year) {
      case 2010: spref = "c10_";
//        console.log("Prefixe: " + selem.year + " = c_10");
      break;
      case 2000: spref = "c00_";
//        console.log("Prefixe: " + selem.year + " = c_00");
      break;
      case 1991: spref = "c91_";
//        console.log("Prefixe: " + selem.year + " = c_91");
      break;
      case 1980: spref = "c80_";
//        console.log("Prefixe: " + selem.year + " = c_80");
      break;
      case 1970: spref = "c70_";
//        console.log("Prefixe: " + selem.year + " = c_70");
      break;
      case 1960: spref = "c60_";
//        console.log("Prefixe: " + selem.year + " = c_60");
      break;
      default: spref = "c10_";
//      console.log("Sem prefixo!");
               break;
    }
//    console.log("Prefixe: " + spref);
    if (i < (arrayVar.length - 1))
       shearder += spref + svarCode  + ", ";
    else
       shearder +=  spref + svarCode;
    console.log("Process year: " + selem.year);
    if (arrayAnos.indexOf(selem.year) == -1) {
       console.log("Insert year: " + selem.year);
       arrayAnos.push(selem.year);
    }
  }
  console.log("Array years: " + arrayAnos);
  shearder +=  " FROM cHeader." + strCollection + "Header";
  if (sview) 
    shearder += " WHERE (0=1) "
  else 
    shearder += " WHERE (1=1) ";
  console.log("Select header: " + shearder);
  arraysql.push(shearder);
  
  var sSchema = exports.obtemSchemaMonet (arrayAnos);
  
  console.log("Schemas: " + sSchema);
  
  for (x = 0; x < sSchema.length; x++) {
    console.log(" Process Schema: " + JSON.stringify(sSchema[x]) + "  [Ano: "  + sSchema[x].ano + " Schema " + sSchema[x].schema + "]");
    var ssql = "";
    var ssqlfields = "SELECT ";
    // Variáveis selecionadas para pesquisa
    for (i = 0; i < arrayVar.length; i++) {
      var selem = arrayVar[i];
      console.log("Process variavel : " + selem.year + " - " + selem.varCode);
      if (selem.year ==  sSchema[x].ano){
        //console.log("Adiciona element field: " + selem.year + " variavel: " + selem.varCode);
        var svarCode = selem.varCode.replace("VAR","V");
        if (i > 0) {
          // Clóvis
          // ssqlfields += ",\"A" + sSchema[x].ano + "\"." + svarCode;
          ssqlfields += ", cast(" + svarCode + " as varchar(20))";
        } else
          // Clóvis
          // ssqlfields += "\"A" + sSchema[x].ano + "\"." + svarCode;
          ssqlfields += "cast(" + svarCode + " as varchar(20))";
      } else {
        if (i > 0) 
           ssqlfields += ",''";
        else
           ssqlfields += "''";
      }
    }
    console.log("Variáveis selecionadas: " + ssqlfields);
    
    // Where referente as UFs
    // console.log("Initialization process UFs");
    // var ssqluf = "";    console.log("Initialization process UFs");
    // var ssqluf = "";
    // var cont = 0;
    // for (i = 0; i < arrayUF.length; i++) {
    //   var selem = JSON.parse(arrayUF[i]);sSchema[x].ano
    //   console.log(JSON.stringify(selem) + " Process UF id: " + selem._id + " year: " + selem.Ano + " UF: " + selem.State);
    //   console.log("Comparar: " + selem.Ano + " == " + sSchema[x].ano);
    //   if (selem.Ano ==  "1991") {
    //     if (cont == 0) {
    //       ssqluf += selem._id;
    //       cont++;
    //     }
    //     else 
    //       ssqluf +=  "," + selem._id;        
    //   }
    // }
    //console.log("UFs selecionadas: " + ssqluf);

    //Clóvis
    // ssql = ssqlfields + " FROM c" + sSchema[x].ano + "." + strCollection + " as \"A" + sSchema[x].ano +"\"";
    ssql = ssqlfields + " FROM c" + sSchema[x].ano + "." + strCollection; // + " as \"A" + sSchema[x].ano +"\"";
    // sSchema[x].ano + "\"." + svaruf  + " WHERE \"A" + " IN (" + ssqluf + ")";    
    console.log("VISUALIZAR: " + sview + " Collection: " + strCollection);
    var svaruf = exports.obtemVarEstado (sSchema[x].ano);
    //Clóvis
    // ssql = ssqlfields + " FROM c" + sSchema[x].ano + "." + strCollection + " as \"A" + sSchema[x].ano +"\"";
    ssql = ssqlfields + " FROM c" + sSchema[x].ano + "." + strCollection; // + " as \"A" + sSchema[x].ano +"\"";
    // sSchema[x].ano + "\"." + svaruf  + " WHERE \"A" + " IN (" + ssqluf + ")";    
    var sid = "";
    if (sview) {
      console.log("Processa WHERE");
      if (strCollection == "tPes") 
        sid = "idpessoa"
      else 
        sid = "iddomicilio"
      ssql += " WHERE (" +  sid + " < " + (12/sSchema.length) +") ";
    }
    console.log("Censo: " + sSchema[x].ano + " SQL parcial " + ssql);
    arraysql.push(ssql);
  }
  
  // SQL FULL
  var ssqlfull = "";
  for (i = 0; i < arraysql.length; i++) {
     if (i > 0) 
        ssqlfull += ' UNION ALL ' +  arraysql[i];
     else
        ssqlfull += arraysql[i];
  }
  //console.log("Visualiza : " + sview + " SQL FULL: " + ssqlfull);
  return ssqlfull;

}

exports.getQryData = function (objReq) {
  var selVar = objReq.selectedVariables;
  //console.log ("selVar: ", selVar);

  var objRet = [];
  var objVar = {};
  
  for (i = 0; i < selVar.length; i++) {
    var intIdxYear = -1;
    
    for (j = 0; j < objRet.length; j++) {
      if (objRet [j].year == selVar [i].year) {
        intIdxYear = j;
        //console.log ("Encontrou year: ", intIdxYear);
      }
    }

    if (intIdxYear >= 0) {
      // Já existe um registro de ano
      console.log ("02 - intIdx já existe. Inclui varCode: ", selVar [i].varCode);
      objRet[intIdxYear].var.push (selVar [i].varCode);
    } else {
      console.log ("02 - NOVO ANO. Inclui: ", selVar [i].year, selVar [i].varCode);
      objVar = {"year":selVar [i].year,"var":[selVar [i].varCode]};
      objRet.push (objVar);
    }
  }

  console.log ("03 - Fim GetQyrData: ", objRet);

  return objRet;
}

exports.getEmailHTMLBody = function (strUniqueID, objQryData) {
  var strHTML = "";
  var strVarTable = "";
  var strManualLink = "";

  console.log ("objQryData: ", objQryData);

  strManualLink = "<div> Manuais IBGE:";

  strVarTable = "<table style='border: 1px solid black;width:200px;text-align:center'>" +
      "  <tr style='border: 1px solid black;width:200px;text-align:center'>" +
      "    <th bgcolor='#98d4ff' style='border: 1px solid black;width:200px;text-align:center'>Ano</th>" +
      "    <th bgcolor='#98d4ff' style='border: 1px solid black;width:200px;text-align:center'>Variável</th> " +
      "  </tr>";

  // Consulta para cada ano
  console.log ("Vai verificar dados para email:")
  for (i = 0; i < objQryData.length; i++) {
    strManualLink += "  <br>" +
        "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
        " <a href='http://" + cfg.APP_IP + "/" + cfg.APP_CENSO_MANUAL_FILES_FOLDER + "Manual" + objQryData[i].year + ".zip'> Censo " + objQryData[i].year + " </a>";
    var varSel = objQryData[i].var;
    // Consulta para cada variável do ano
    for (j = 0; j < varSel.length; j++) {
      strVarTable += "  <tr style='border: 1px solid black;width:200px;text-align:center'>" +
          "    <td style='border: 1px solid black;width:200px;text-align:center'>" + objQryData[i].year + "</td>" +
          "    <td style='border: 1px solid black;width:200px;text-align:center'>" + varSel [j] + "</td>" +
          "  </tr>";
    }
  }

  strManualLink += "</div>";
  strVarTable += "</table>";
  
  strHTML = "<style>" +
      "table, th, td {" +
      "    border: 1px solid black;" +
      "	width:200px;" +
      "	text-align:center;" +
      "}" +
      "</style>" +
      "<h1>CEM - Plataforma de extração de dados censitários</h1>" +
      "<h2>Arquivos disponíveis.</h2>" +
      "<p>Para baixar os arquivos, clique nos links abaixo</p>" +
      "<p>Dados extraídos:" +
      "  <br>" +
      "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      " <a href='http://" + cfg.APP_IP + ":" + cfg.APP_PORT + "/files/download?file=" + strUniqueID + "&ty=0'>Arquivo de dados</a>" +
      "  <br>" +
      "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      " <a href='http://" + cfg.APP_IP + ":" + cfg.APP_PORT + "/files/download?file=" + strUniqueID + "&ty=1'> Dicionário de dados</a>" +
      "</p>" +
      strManualLink +
      "<p><u>Atenção</u>:&nbsp;<i>Os arquivos ficarão disponíveis por 24h</i></p>" +
      "<h2>Variáveis extraídas:</h2>" +
      strVarTable +
      "<p><i>Atenciosamente,<br>Equipe CEM</i></p>";

  return (strHTML)  ;
}
  
