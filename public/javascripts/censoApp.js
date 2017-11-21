// The "censoApp" parameter refers to an HTML element in which the application will run.
// The [] parameter in the module definition can be used to define dependent modules.
// Without the [] parameter, you are not creating a new module, but retrieving an existing one.
var censoApp = angular.module('censoApp',[]);

var strCfgBD = "monet";
//cfg = require ('../../parameters.js');

// Module that contains the controllers used in the main app page index.html

// Add a controller to application to show samples of the a query
/* Clóvis */
censoApp.controller('censoController', ['$scope', '$http', function sendData($scope, $http) {
    alert ('Iniciou censoController!')
    $http({
        method : 'get',
        url : '/data'
    }).then(function mySuccess(response) {
        $scope.dataQuery = response.data;
    }, function myError(response) {
        console.log('Error: ' + response.data);
    });

    // .success and .error methods are deprecated in Angular 1.6
}]);
/* */

// Controller to capture the main form (current all page) submit to generate file sample and generate file
censoApp.controller('submitController',['$scope', '$http', function ($scope, $http) {
    //$scope.data = {};
    $scope.parameters = {};
    console.log('CensoApp: submitController');

    $scope.parameters.formatoDados = "csv-commas";

    $scope.InfoVar = function(objVar){
        console.log('CensoApp.submitController: InforVar clicked -> infoVAR', objVar);

        $scope.codigoVariavel = objVar.varCode;
        $scope.anoVariavel = objVar.year;
        $scope.textoDescricaoVar = objVar.description;
        $scope.textoPopToApplyVar = objVar.popToApply;
        $scope.categoryTableClass = "table-hide";
        //       $scope.tabActive = "active";
        $scope.textoObsVar = objVar.obs;

        console.log ("Tipo dados: ", $scope.parameters.tabela)

        $http.get('/categories?coll=' + $scope.parameters.tabela + '&var=' + objVar.varCode +'&ano=' + objVar.year)
        .then(function (response) {
            console.log ("data");
            console.log (response.data);
            console.log ("data[0].==> DBNAME ==> ", response.data[0].dbName);

            $scope.data = [];

            if (objVar.catType == 0 || objVar.catType == 5) {
                console.log ("Coleção: ", response.data[0].collection.variable.category[0].value);
                var strColecao = "";

                if (response.data[0].collection.variable.category[0].value == "col" ||
                    response.data[0].collection.variable.category[0].value == 0)
                {
                    console.log ("Vai procurar: ", response.data[0].collection.variable.category[0].label);
                    strColecao = response.data[0].collection.variable.category[0].label
                    //console.log (strColecao);
                    $http.get('/auxiliares?coll=' + strColecao + '&ano=' + objVar.year + '&dbName=' + response.data[0].dbName)
                    .then(function (responseAux) {
                        //console.log (responseAux.data)
                        
                        $scope.data = {
                            model: null,
                            category: responseAux.data
                        };
                        
                    }, function myError(responseAux) {
                        console.log('Error: ' + responseAux.data);
                    });
                }
            }

            // Preenche categorias.
            switch (objVar.catType) {
            case 0:
            case 5: $scope.textoCategoriaVar = "";
                    $scope.categoryTableClass = "table-show";
                break;
            case 1:
            case 2:
    //            break;
            case 6: $scope.textoCategoriaVar = "";
                    $scope.categoryTableClass = "table-show";
                    $scope.data = {
                        model: null,
                        category: response.data[0].collection.variable.category
                    };
                break;
            case 3:
            case 4: $scope.textoCategoriaVar = "Campo de valor variável." + '\n' + "Sem categorias";
                    $scope.categoryTableClass = "table-hide";
                break;
    //          case "5": $scope.textoCategoriaVar = "Coleção:";
    //            break;
            default: $scope.textoCategoriaVar = "Consultar categorias.";
                     $scope.categoryTableClass = "table-hide";
                console.log("Sem Estado");
                break;
            }
         }, function myError(response) {
            console.log('Error: ' + response.data);
            switch (objVar.catType) {
            case 0:
            case 5: $scope.textoCategoriaVar = "Coleção:";
                break;
            case 1:
            case 2:
            case 6: $scope.textoCategoriaVar = "Categorias:";
                break;
            case 3:
            case 4: $scope.textoCategoriaVar = "Campo de valor variável." + '\n' + "Sem categorias";
                break;
            default: $scope.textoCategoriaVar = "Consultar categorias.";
                console.log("Sem Estado");
                break;
            }
        });
    }

    
    $scope.submitTESTErem = function(objIndex){
        console.log('CensoApp.submitController: testeREM clicked -> testeREM');
        $scope.parameters.selectedVariables.splice (1,1);
        //$scope.parameters.selectedVariables.pop();
        //$scope.parameters.selectedVariables.pop();
    }
        
    $scope.RemoveVar = function(objVar, objIndex){
        console.log('CensoApp.submitController: RemoveVar clicked -> RemoveVAR');

        //console.log(objIndex);
        $scope.parameters.selectedVariables.splice (objIndex,1);

        // Verifica se variável está na lista de variáveis de tema e "recoloca".
        $scope.$emit ("varEnableThemeSelected", objVar);
        
    }

    // submitQuery generate the sample file to be generated.
    $scope.submitQuery = function(){
        console.log('CensoApp.submitController: submit clicked -> submitQuery');
        console.log($scope.parameters);

        // Consistência. Verifica Tipo de arquivo, Ano, Coleção e Variáveis (obrigatórios)
        // Todo: Hierarquia
        // Estado não é obrigatório.
        /*
        if ($scope.parameters.ano == null || $scope.parameters.ano == "") {
            bootbox.alert ({ 
                size: "small",
                title: "Falta informação",
                message: "<h4>Favor selecionar um ano</h4>"});
            //alert("Favor selecionar um ano!!!");
            return;
        }
        */
        if ($scope.parameters.selectedVariables == null || $scope.parameters.selectedVariables[0] == null) {
            bootbox.alert ({ 
                size: "medium",
                title: "Visualizar variáveis",
                message: "<div class='alert alert-warning' role='alert'>" +
                "  Não há variáveis selecionadas!" +
                "</div>"
            });
            // alert("Favor selecionar uma ou mais variáveis");
            return;
        }

        if ($scope.parameters.formatoDados == null || $scope.parameters.formatoDados == "") {
            alert("Favor selecionar um formato de dados");
            return;
        }


        /*
var strHTML = "<div style='height:185px;width:600px;overflow-x:auto'>" +
    "<form> First name: <input id='inputEmail' type='text' name='email' value='E-mail'></input></form>" +
	"<table id = 'tabSelectedVariablesModal' class='table table-striped table-condensed' size='10px' style='height:0px;font-size: 11px'>" +
	"<tr>" +
		"<th style='vertical-align:middle;'>Ano</th>" +
		"<th style='vertical-align:middle;'>Código</th>" +
	"</tr>" +
	"<tr>" +
		"<td style='vertical-align:middle;'>Year</td>" +
		"<td style='vertical-align:middle;'>Label</td>" +
	"</tr>" +
	"<tr>" +
		"<td style='vertical-align:middle;'>Year1</td>" +
		"<td style='vertical-align:middle;'>Label1</td>" +
	"</tr>" +
	"</table>" +
"</div>";
*/
        
        $scope.parameters.email = "";

        var dialog = bootbox.dialog({
            title: 'Prévia e geração do arquivo',
            message: '<p><i class="fa fa-spin fa-spinner"></i>carregando dados...</p>',
            buttons: {
                cancel: {
                    label: "Cancelar",
                    className: 'btn-danger',
                    callback: function(){
                        console.log('Custom cancel clicked');
                    }
                },
                /*
                noclose: {
                    label: "Custom button",
                    className: 'btn-warning',
                    callback: function(){
                        console.log('Custom button clicked');
                        return false;
                    }
                },
                */
                ok: {
                    label: "Gerar arquivo",
                    className: 'btn-info',
                    callback: function(){
                        console.log('Custom OK clicked', $("#inputEmail").val());
                        strEmailRet = $("#inputEmail").val();
                        $scope.parameters.email = strEmailRet;
                        // Gera arquivo e envia e-mail
                        $scope.submitGeraArquivo();
                    }
                }
            }
        });
        dialog.init(function(){
            /*
            setTimeout(function(){
                dialog.find('.bootbox-body').html('I was loaded after the dialog was shown!' + strHTML);
            }, 3000);
            */
            // Atualiza informações na página principal
            $scope.msgConfirmaGera = "";
            $scope.baixarArq = "";
            $scope.texto = "";
            $scope.dataQuery = {};
            // Preenche dados do arquivo na tela
            var strURL = "/queryMonet";
            $http({
                method: 'post',
                url: strURL,
                data: $scope.parameters
            }).then(function(httpResponse){
                // this callback will be called asynchronously
                // when the response is available
                $scope.dataQuery = httpResponse.data;
                //console.log(httpResponse.data);
                console.log('\n\nQuery executed successfully!!');
                // Gera tabela de amostras:
                var strHTMLVar = "<div style='height:500px;width:100%;overflow-x:auto'>" +
                    "<form>" +
                    "<div class='form-group'>" +
                    " <input id='inputEmail' type='email' name='email' value='' class='form-control is-invalid' aria-describedby='emailHelp' placeholder='Insira o e-mail destino' required>" +
                    " <small id='emailHelp' class='form-text text-muted'>Não compartilharemos seu email com ninguém.</small>" +
                    "</div>" +
                    "<div class='form-group'>" +
                    "<table id = 'tabSelectedVariablesModal' class='table table-striped table-condensed' size='10px' style='height:0px;font-size: 11px'>" +
                    "<tr>";
                // Monta cabeçalho.

                var objCabecalho = httpResponse.data [0];
                var objKey = [];
                for (fieldName in objCabecalho) {
                    console.log ("Campo: ", fieldName);
                    strHTMLVar += "<th style='vertical-align:middle;'>" + fieldName + "</th>";
                    objKey.push (fieldName);
                }

                strHTMLVar += "</tr>";

                // Monta linhas
                for (i = 0; i < httpResponse.data.length; i++) {
                    strHTMLVar += "<tr>";
                    console.log (i, " - ", httpResponse.data[i]);
                    for (j = 0; j < objKey.length; j++) {
                        strHTMLVar += "<td style='vertical-align:middle;'>" + httpResponse.data[i][objKey[j]] +
                                    "</td>";
                    }
                    strHTMLVar += "</tr>";
                }
                
                strHTMLVar += "</table>" +
                            "</div>"+
                            "</form>"+
                            "</div>";

                dialog.find('.bootbox-body').html(strHTMLVar);


            }, function(httpResponse) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                $scope.msg = 'Erro na execução da Query'; 
            });

            
        });        
        
        /**
        // Atualiza informações na página principal
        $scope.msgConfirmaGera = "";
        $scope.baixarArq = "";
        $scope.texto = "";
        $scope.dataQuery = {};
        // Preenche dados do arquivo na tela
        var strURL = "/queryMonet";
        $http({
            method: 'post',
            url: strURL,
            data: $scope.parameters
        }).then(function(httpResponse){
            // this callback will be called asynchronously
            // when the response is available
            $scope.dataQuery = httpResponse.data;
            //console.log(httpResponse.data);
            console.log('\n\nQuery executed successfully!!');
            // Gera tabela de amostras:
            var strHTMLVar = "<div style='height:185px;width:600px;overflow-x:auto'>" +
                "<form> First name: <input id='inputEmail' type='text' name='email' value='E-mail'></input></form>" +
                "<table id = 'tabSelectedVariablesModal' class='table table-striped table-condensed' size='10px' style='height:0px;font-size: 11px'>" +
                "<tr>";
            // Monta cabeçalho.

            var objCabecalho = httpResponse.data [0];
            var objKey = [];
            for (fieldName in objCabecalho) {
                console.log ("Campo: ", fieldName);
                strHTMLVar += "<th style='vertical-align:middle;'>" + fieldName + "</th>";
                objKey.push (fieldName);
            }

            strHTMLVar += "</tr>";

            // Monta linhas
            for (i = 0; i < httpResponse.data.length; i++) {
                strHTMLVar += "<tr>";
                console.log (i, " - ", httpResponse.data[i]);
                for (j = 0; j < objKey.length; j++) {
                    strHTMLVar += "<td style='vertical-align:middle;'>" + httpResponse.data[i][objKey[j]] +
                                  "</td>";
                }
                strHTMLVar += "</tr>";
            }
            
            strHTMLVar += "</table>" +
                        "</div>";




        }, function(httpResponse) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.msg = 'Erro na execução da Query'; 
        });
        **/
    }

    $scope.submitSelect = function(){
        console.log('CensoApp.submitController: submit clicked -> submitSelect');
        console.log($scope.parameters);

        // Consistência. Verifica se há Variáveis de Tema selecionadas (obrigatórios)
        
        if ($scope.parameters.variaveis == null || $scope.parameters.variaveis[0] == null) {
            bootbox.alert ({
                size: "medium",
                title: "Seleção de variáveis",
                message: "<div class='alert alert-warning' role='alert'>" +
                "  Não há variáveis de tema selecionadas" +
                "</div>"
            });
            return;
        }
        

        if (!$scope.parameters.selectedVariables) {
            console.log ("Vai criar selectedVariables")
            $scope.parameters.selectedVariables = [];
        }

        for (i=0; i < $scope.parameters.variaveis.length; i++) {
            var objVar = {};
            objVar = JSON.parse($scope.parameters.variaveis[i]).collection.variable;
            // Verifica se variável já foi selecionada.
            var bolExiste = false;
            angular.forEach ($scope.parameters.selectedVariables, function (key,value) {
              if ((key.varCode == objVar.varCode) &&(key.year == objVar.year)) {
                  // Variável já existe na lista de selecionadas
                  bolExiste = true;
              }
            });
            if (!bolExiste) {
                // Variável ainda não existe. Vai incluir na lista.
                $scope.parameters.selectedVariables.push (objVar);

                objTabela = $scope.parameters;
                objParam = {params:objTabela};
                // Desabilita variável selecionada na lista temática, se houver.
                $scope.$emit ("varDisable", objVar);
            }
        }
    }

    // submitGeraArquivo will generate the file. (/geraArq POST request)
    $scope.submitGeraArquivo = function() {
        console.log('clicked submit Gera Arquivo');
        console.log($scope.parameters);

        if ($scope.parameters.selectedVariables == null || $scope.parameters.selectedVariables[0] == null) {
            bootbox.alert ({ 
                size: "medium",
                title: "Gerar arquivo",
                message: "<div class='alert alert-warning' role='alert'>" +
                "  Não há variáveis selecionadas!" +
                "</div>"
            });
            return;
        }
        
        if ($scope.parameters.formatoDados == null || $scope.parameters.formatoDados == "") {
            alert("Favor selecionar um formato de dados");
            return;
        }
        
        //$scope.parameters.email = "";

        /*
        bootbox.prompt ({
            title: "Favor inserir e-mail destino:" + $scope.parameters.email,
            inputType: "email",
            callback: function (result) {
                if (!result) {
                    console.log("CANCELADO!");
                } else {
        */
                    console.log("Vai gerar!!");
                    var strEmail = $scope.parameters.email;
                    // Atualiza informações na página principal
                    $scope.msgConfirmaGera = "Processando...";
                    $scope.baixarArq = "";

                    var strChosenDB = '/files/geraArqMonet';
                    //$scope.parameters.email = strEmail;
                    
                    $http({
                        method: 'post',
                        url: strChosenDB,
                        data: $scope.parameters
                    }).then(function(httpResponse){
                        // this callback will be called asynchronously
                        // when the response is available
                        //var resultado = httpResponse.data;
                        var resultado = JSON.parse (httpResponse.data);
                        if (resultado.resultado == 1) {
                            // Geração do arquivo OK.
                            console.log ("Arquivo gerado! : " + resultado.file);
                            // Arquivo gerado. Atualiza informações na tela.
                            $scope.dataFile = httpResponse.data;
                            //$scope.texto = resultado.file;
                            $scope.texto = "";
                            $scope.msgConfirmaGera = "Link para download será enviado para o e-mail:";
                            $scope.baixarArq = strEmail;
                            //$scope.fileLink = "files/download/?file=" + resultado.file;
                            $scope.fileLink = "";
                        } else {
                            // Erro na geração do arquivo.
                            console.log ("Erro na geração! : " + resultado.file);
                            $scope.msgConfirmaGera = "Arquivo não gerado";
                            $scope.baixarArq = resultado.file.substring (0,50);
                            $scope.texto = "";
                            $scope.fileLink = "" + resultado.file;
                        }

                    }, function(httpResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        $scope.msg = 'Erro na geração do arquivo:('; 
                    });
        /*
                }

            }
        }); // bootbox
        */
    } //$scope.submitGeraArquivo

    $scope.submitGeraArquivo2 = function() {
        console.log('clicked submit Gera Arquivo2');
        console.log($scope.parameters);

        
        $scope.parameters.email = "";

        bootbox.prompt ({
            title: "Favor inserir e-mail destino:",
            inputType: "email",
            callback: function (result) {
                if (!result) {
                    console.log("CANCELADO!");
                } else {
                    console.log("Vai gerar!!");
                    var strEmail = result;
                    // Atualiza informações na página principal
                    $scope.msgConfirmaGera = "Processando...";
                    $scope.baixarArq = "";

                    var strChosenDB = '/files/geraArqMonet-2';
                    if (strCfgBD == "monet") {
                        strChosenDB = '/files/geraArqMonet-2';
                    } else {
                        strChosenDB = '/files/geraArqMongo';
                    }

                    $scope.parameters.email = strEmail;
                    
                    $http({
                        method: 'post',
                        url: strChosenDB,
                        data: $scope.parameters
                    }).then(function(httpResponse){
                        // this callback will be called asynchronously
                        // when the response is available
                        //var resultado = httpResponse.data;
                        var resultado = JSON.parse (httpResponse.data);
                        if (resultado.resultado == 1) {
                            // Geração do arquivo OK.
                            console.log ("Arquivo gerado! : " + resultado.file);
                            // Arquivo gerado. Atualiza informações na tela.
                            $scope.dataFile = httpResponse.data;
                            $scope.baixarArq = strEmail;
                            //$scope.texto = resultado.file;
                            $scope.texto = "";
                            $scope.msgConfirmaGera = "link para download será enviado para o e-mail:";
                            //$scope.fileLink = "files/download/?file=" + resultado.file;
                            $scope.fileLink = "";
                        } else {
                            // Erro na geração do arquivo.
                            console.log ("Erro na geração! : " + resultado.file);
                            $scope.msgConfirmaGera = "Arquivo não gerado";
                            $scope.baixarArq = resultado.file.substring (0,50);
                            $scope.texto = "";
                            $scope.fileLink = "" + resultado.file;
                        }

                    }, function(httpResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        $scope.msg = 'Erro na geração do arquivo:('; 
                    });
                }

            }
        });
    } //$scope.submitGeraArquivo2

    $scope.$on ("clearDataQuery", function(event, data) {
        console.log ("Clear Data Query")
        $scope.msgConfirmaGera = "";
        $scope.texto = "";
        $scope.fileLink = "";
        $scope.dataQuery = [];
    });

}]);

//Add a controller to App to show the list of Brazil's states
censoApp.controller('ufsController', function($scope, $http) {
    // NÃO está mais sendo chamado no início. UFS não está mais sendo usado!
    return;
    console.log ('Run ufsController');
    //console.log ($scope);
    $scope.data = [];
    // A função $http.get ('/ufs') faz a solicitação,
    // então atribuimos o resultado a $scope.data

    $http.get('/ufs')
    .then(function (response){        
        $scope.data = {
            model: null,
            ufs: response.data
        };
     }, function myError(response) {
        console.log('Error: ' + response.data);
    });

    $scope.$on ("callFillUFs", function(event, data) {
        console.log ("on callFillUFs: " + data.params.ano);

        $http.get('/ufs', data)
        .then(function (response){        
            //console.log (response.data);
            $scope.data = {
                model: null,
                ufs: response.data
            };
        }, function myError(response) {
            console.log('Error: ' + response.data);    
        });

        $scope.parameters.estado = "";
        
    });

    $scope.changeUF = function () {
        console.log ("changeUF: " + $scope.parameters.estado);
        $scope.$emit ("clearDataQuery", objParam);
    }
});

//Add a controller to App to show the census's themes
censoApp.controller('themeController',['$scope', '$rootScope', '$http', listThemes]);

function listThemes($scope, $rootScope, $http) {

    $rootScope.$on ("callFillThemes", function(event, data) {
        console.log ("on callFillThemes: " + $scope.parameters);

        $http.get('/theme', data)
        .then(function (response){        
            console.log (response.data);
            $scope.data = {
                model: null,
                themes: response.data
            };
        }, function myError(response) {
            console.log('Error: ' + response.data);    
        });

        $scope.parameters.theme = "";
    });

    // função chamada toda vez q altera ano do cesnso
    $scope.changeTheme = function () {
        //console.log ("on changeTheme - back: " + JSON.parse ($scope.parameters.theme).label);
        objTabela = $scope.parameters;
        objParam = {params:objTabela};
        console.log ("on changeTheme - back: " + objParam);
        
        $scope.$emit ("callFillVar", objParam);
        
        // Preenche a lista de UFs de acordo com o ano *** Não está mais sendo chamado!
        //$rootScope.$broadcast ("callFillUFs", objParam);
        // Clear Data Query
        $rootScope.$broadcast ("clearDataQuery", objParam);
    }
};

//Add a controller to App to show the census's years
censoApp.controller('yearsController',['$scope', '$rootScope', '$http', listYears]);

function listYears($scope, $rootScope, $http) {

    $http.get('/year')
    .then(function (response){
        // build object to fill year combo
        var objYear = [];
        for (i = 0; i < response.data.length; i++) {
            var elementYear = {};
            elementYear.codYear = response.data [i]._id;
            elementYear.year = response.data [i].year;
            objYear.push (elementYear);
        }
        $scope.data = {
            model: null,
            years: objYear
        };
        // console.log ($scope.data.years);

     }, function myError(response) {
        console.log('YEAR Error: ' + response.data);    
    });
    
    // função chamada toda vez q altera ano do cesnso
    $scope.changeCenso = function () {
        console.log ("changeCenso: " + $scope.parameters.ano);
        objTabela = $scope.parameters;
        objParam = {params:objTabela};

        // Preenche a lsita de coleções
        $scope.$emit ("callFillVar", objParam);
        
        // Preenche a lista de UFs de acordo com o ano *** Não está mais sendo chamado!
        //$rootScope.$broadcast ("callFillUFs", objParam);
        // Clear Data Query
        $rootScope.$broadcast ("clearDataQuery", objParam);
    }
};

//Add a controller to App to show the census's tables
censoApp.controller('tablesController', function ($scope, $rootScope, $http) {

    console.log ('Run tablesController');

    $scope.data = [];

    $scope.updateVars = function () {
        console.log ("Mudou coleção. ", $scope.parameters.tabela);
        if (($scope.parameters.tabelaAnt) || ($scope.parameters.tabelaAnt == "")) {
            console.log ("Tem tabela anterior: ", $scope.parameters.tabelaAnt);
        } else {
            console.log ("Não tem tabela anterior. Vai criar.");
            $scope.parameters.tabelaAnt = "";
        }
        // Verifica se existem variáveis selecionadas:
        if (($scope.parameters.selectedVariables != null) && 
            ($scope.parameters.selectedVariables[0] != null)) {
            bootbox.confirm({
                title: "Alteração de tipo de dados",
                message: "<div class='alert alert-warning' role='alert'>" +
                "  Há variáveis selecionadas. A mudança de tipo de dados descartará essas variáveis!" +
                "</div>",
                buttons: {
                    confirm: {
                        label: 'Continua',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'Cancela',
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        // Apaga variáveis selecionadas;
                        console.log('RESULTADO MUDANÇA DADOS: Apaga selecionados 1' + result);
                        objTabela = $scope.parameters;
                        objParam = {params:objTabela};
                        console.log(objParam.params);
                        $scope.parameters.selectedVariables = [];
                        $scope.parameters.tabelaAnt = $scope.parameters.tabela;
                        $scope.$emit ("callFillThemes", objParam);
                        $scope.$emit ("callFillVar", objParam);
                        $scope.$emit ("clearDataQuery", objParam);
                    } else {
                        // volta tipo de dados anterior
                        console.log('RESULTADO MUDANÇA DADOS: Volta anterior e retorna. ' + result);
                        $scope.parameters.tabela = $scope.parameters.tabelaAnt;
                        return;
                    }
                }
            });
        } else {
            $scope.parameters.tabelaAnt = $scope.parameters.tabela;
            objTabela = $scope.parameters;
            objParam = {params:objTabela};
            console.log(objParam.params);
            $scope.$emit ("callFillThemes", objParam);
            $scope.$emit ("callFillVar", objParam);
            $scope.$emit ("clearDataQuery", objParam);
        }
    }

    $scope.$on ("callFillTables", function(event, data) {
        console.log ("on callFillTables: " + data.params.ano);
        $scope.data = [];

        $http.get ('/collection', data)
        .then(function (response){
            //console.log (response.data);
            $scope.data = {
                model: null,
                colecoes: response.data
            };
        }, function myError(response) {
            console.log('Error: ' + response.data);    
        });
        
        
        // Associa vazio para apagar tabela que está selecionada!
        $scope.parameters.tabela = "";
        objTabela = $scope.parameters;
        objParam = {params:objTabela};
        // Atualiza variáveis
        $scope.$emit ("callFillVar", objParam);
        /*
        $scope.$apply (function () {
            $scope.parameters.tabela = "";
        });
        */
        
    });
});

//Add a controller to App to show the list of table's variable
censoApp.controller('variaveisController', function($scope, $rootScope, $http) {
    $scope.data = [];
    // A função $http.get ('/variaveis') faz a solicitação,
    // então atribuimos o resultado a $scope.data
    console.log ('Run variaveisController');
    console.log($scope.parameters);

    $http.get('/variaveis')
    .then(function (response){
        // console.log (response.data);
        $scope.data = {
            model: null,
            variaveis: response.data
        };
     }, function myError(response) {
        console.log('Error: ' + response.data);    
    });

    // Preenche lista de variáveis (de tema)
    $rootScope.$on ("callFillVar", function(event, data) {
        console.log ('on callFillVar');
        $http.get('/variaveis', data)
        .then(function (response){
            //$scope.data.variaveis = "";
            if ($scope.data.variaveis[1] != null) {
              console.log ($scope.data.item)
            }
            
            console.log ('CallFillVar: $http.get /variaveis - response.data');
            if (data.params.theme) {
                // Tema foi escolhido
                console.log (JSON.parse(data.params.theme).label);
                $scope.temaEscolhido = " (" + JSON.parse(data.params.theme).label + ")";
            } else {
                $scope.temaEscolhido = "";
            }

            // Verifica se alguma variável está na lista de selecionadas.
            // Se estiver, carrega desabilitada.
            if ($scope.parameters.selectedVariables) {
                if ($scope.parameters.selectedVariables.length > 0) {
                    for (i = 0; i < $scope.parameters.selectedVariables.length; i++) {
                        for (j = 0; j < response.data.length; j++) {
                            if (($scope.parameters.selectedVariables[i].varCode == response.data[j].collection.variable.varCode) &&
                               ($scope.parameters.selectedVariables[i].year == response.data[j].collection.variable.year)) {
                                   response.data[j].collection.variable.disabled = "option-selected";
                            }
                        }
                    }


                } else {
                    console.log ("Lista de selecionadas vazia")
                }
            } else {
                console.log ("Lista de selecionadas não existe")
            }

            $scope.data = {
                model: null,
                variaveis: response.data
            };
            $scope.data.selected = 0;
            
        }, function myError(response) {
            console.log('Error ($http.get /callFillVar): ' + response.data);    
        });
    })
    
    $rootScope.$on ("varEnableThemeSelected", function(event, data) {
        console.log ('on varEnableThemeSelected: ', data.year, '-', data.varCode);
        //console.log ($scope.data.variaveis);

        var bolAchou = false;
        var i = 0;
        while ((i < $scope.data.variaveis.length) && (!bolAchou)) {
            if (($scope.data.variaveis[i].collection.variable.varCode == data.varCode) &&
                ($scope.data.variaveis[i].collection.variable.year == data.year)) {
                    // Encontrou variável. Habilita.
                    $scope.data.variaveis[i].collection.variable.disabled = "";
                    bolAchou = true;
            };
            i++;
        }
    })

    // Desabilita variável na lista de variáveis de tema.
    $rootScope.$on ("varDisable", function(event, data) {
        console.log ('on varDisable: ', data.year, '-', data.varCode);
        //console.log ($scope.data.variaveis);

        var bolAchou = false;
        var i = 0;
        // Faz busca linear e todas as variáveis da lista de tema, até encontrar ou até o fim.
        while ((i < $scope.data.variaveis.length) && (!bolAchou)) {
            if (($scope.data.variaveis[i].collection.variable.varCode == data.varCode) &&
                ($scope.data.variaveis[i].collection.variable.year == data.year)) {
                    // Encontrou. Desabilita (associa à classe de selecionado)
                    $scope.data.variaveis[i].collection.variable.disabled = "option-selected";
                    // Variável já existe na lista de selecionadas
                    bolAchou = true;
            };
            i++;
        }
    })
});

/********* ***********************************************************************/
/********* ***********************************************************************/
