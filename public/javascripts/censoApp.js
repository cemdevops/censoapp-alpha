// The "censoApp" parameter refers to an HTML element in which the application will run.
// The [] parameter in the module definition can be used to define dependent modules.
// Without the [] parameter, you are not creating a new module, but retrieving an existing one.
var censoApp = angular.module('censoApp',[]);

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
    console.log('Chamou function submitController');

    $scope.parameters.formatoDados = "csv-commas";

    // submitQuery generate the sample file to be generated. Fills the variables field
    // (/query POST request)
    $scope.submitQuery = function(){
        console.log('clicked submit');
        console.log($scope.parameters);
        if ($scope.parameters.formatoDados == null || $scope.parameters.formatoDados == "") {
            alert("Favor selecionar um formato de dados");
            return;
        }
        if ($scope.parameters.variaveis == null || $scope.parameters.variaveis[0] == null) {
            alert("Favor selecionar uma ou mais variáveis");
            return;
        }

        $scope.msgConfirmaGera = "Para gerar o arquivo, clique em \"Gerar arquivo\"";
        $http({
            method: 'post',
            url: '/query',
            data: $scope.parameters
        }).then(function(httpResponse){
            // this callback will be called asynchronously
            // when the response is available
            $scope.dataQuery = httpResponse.data;
            //console.log(httpResponse.data);
            console.log('Query executed successfully!!!!!!!');
        }, function(httpResponse) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.msg = 'Erro na execução da Query :('; 
        });
    }

    // submitGeraArquivo will generate the file. (/geraArq POST request)
    $scope.submitGeraArquivo = function() {
        console.log('clicked submit Gera Arquivo');
        console.log($scope.parameters);
        $scope.msgConfirmaGera = "Gerando arquivo...";
        $scope.baixarArq = "";
        $http({
            method: 'post',
            url: '/files/geraArq',
            data: $scope.parameters
        }).then(function(httpResponse){
            // this callback will be called asynchronously
            // when the response is available
            var result = httpResponse.data;
            console.log(result);
            var arrayX= JSON.parse (result)
            console.log ("Arquivo: " + arrayX.file);
            $scope.dataFile = httpResponse.data;
            $scope.baixarArq = "Baixar arquivo gerado.";
            $scope.texto = "Clique para download";
            $scope.msgConfirmaGera = "Arquivo gerado";
            $scope.fileLink = "files/download/?file=" + arrayX.file;
            
            console.log('Arquivo gerado!');
            
        }, function(httpResponse) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.msg = 'Erro na geração do arquivo:('; 
        });
    }

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

//Add a controller to App to show the census's years
censoApp.controller('yearsController',['$scope', '$rootScope', '$http', listYears]);

function listYears($scope, $rootScope, $http) {
    //$scope.data = [];
    // Modificar para obter anos do BD
    $scope.data = {
        model: null,
        years: [
            {codYear:'2010', year:'2010'},
            {codYear:'2000', year:'2000'},
            {codYear:'1991', year:'1991'},
            {codYear:'1980', year:'1980'},
            {codYear:'1970', year:'1970'}
        ]
    };
    
    // função chamada toda vez q altera ano do cesnso
    $scope.changeCenso = function () {
        console.log ("changeANO 1: " + $scope.parameters.ano);
        objTabela = $scope.parameters;
        objParam = {params:objTabela};

        // Preenche a lsita de coleções
        $rootScope.$broadcast ("callFillTables", objParam);
        // Preenche a lista de UFs de acordo com o ano
        $rootScope.$broadcast ("callFillUFs", objParam);
        // Clear Data Query
        $rootScope.$broadcast ("clearDataQuery", objParam);
    }
};

//Add a controller to App to show the census's tables
censoApp.controller('tablesController',['$scope', '$http', '$rootScope', listTables]);

function listTables($scope, $rootScope, $http) {
    console.log ('Run tablesController');
    /*
    $scope.data = {
        model: null,
        tabelas: []
    };
    */
    $scope.data = [];

    $scope.updateVars = function () {
        console.log ("Mudou coleção!!");
        objTabela = $scope.parameters;
//        console.log(objTabela);
        objParam = {params:objTabela};
//        console.log(objParam);
        console.log(objParam.params);
        $scope.$emit ("callFillVar", objParam);
        $scope.$emit ("clearDataQuery", objParam);
    }

    $scope.$on ("callFillTables", function(event, data) {
        console.log ("on callFillTables: " + data.params.ano);
        $scope.data = [];
        // Aqui vai ter que consultar no BD

        switch (data.params.ano) {
          case '2000':
            $scope.data = {
                model: null,
                tabelas: [
                    {codTabela:'domicilio', tabela:'Domicilio'},
                    {codTabela:'pessoa', tabela:'Pessoa'}
                ]
            };
            break;
          case '2010':
            $scope.data = {
                model: null,
                tabelas: [
 //                   {codTabela:'mortalidade', tabela:'Mortalidade'},
 //                   {codTabela:'emigracao', tabela:'Emigração'},
                    {codTabela:'domicilio', tabela:'Domicilio'},
                    {codTabela:'pessoa', tabela:'Pessoa'}
                ]
            };
            break;
          case '1991':
            $scope.data = {
                model: null,
                tabelas: [
                    {codTabela:'domicilio', tabela:'Domicilio'},
                    {codTabela:'pessoa', tabela:'Pessoa'}
                ]
            };
            break;
          case '1980':
            $scope.data = {
                model: null,
                tabelas: [
                    {codTabela:'geral', tabela:'Geral'}
                ]
            };
            break;
          case '1970':
            $scope.data = {
                model: null,
                tabelas: [
                    {codTabela:'geral', tabela:'Geral'}
                ]
            };
            break;
          default:
            break;
        }

// NÃO TEM TABELA
        //console.log ($scope.parameters.tabela);

        // Associa vazio para apagar tabela que está selecionada!
        $scope.parameters.tabela = "";
        objTabela = $scope.parameters;
        objParam = {params:objTabela};

        $scope.$emit ("callFillVar", objParam);
        /*
        $scope.$apply (function () {
            $scope.parameters.tabela = "";
        });
        */
        
    });
};

//Add a controller to App to show the list of table's variable
censoApp.controller('variaveisController', function($scope, $rootScope, $http) {
    $scope.data = [];
    // A função $http.get ('/variaveis') faz a solicitação,
    // então atribuimos o resultado a $scope.data
    console.log ('Run variaveisController');
//    console.log ($rootScope.parameters);
//    $scope.data: $scope.parameters
    console.log($scope.parameters);
    console.log ('OK variaveisController');

    chamVar = $http.get('/variaveis')
    .then(function (response){
        console.log ('$http.get /variaveis');
        $scope.data = {
            model: null,
            variaveis: response.data
        };
     }, function myError(response) {
        console.log('Error: ' + response.data);    
    });

    $rootScope.$on ("callFillVar", function(event, data) {
        console.log ('on callFillVar');
//        console.log ($scope.data);
//        console.log (data);
        // NÃO TEM data.params
        //console.log ("callFillVar: " + data.params);
        $http.get('/variaveis', data)
        .then(function (response){
//            console.log ('$http.get /callFillVar OK');
            $scope.data = {
                model: null,
                variaveis: response.data
            };
        }, function myError(response) {
            console.log('Error ($http.get /callFillVar): ' + response.data);    
        });
    })

});

