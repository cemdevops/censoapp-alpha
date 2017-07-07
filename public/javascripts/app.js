// The "censoApp" parameter refers to an HTML element in which the application will run.
// The [] parameter in the module definition can be used to define dependent modules.
// Without the [] parameter, you are not creating a new module, but retrieving an existing one.
var app = angular.module('censoApp',[]);

// Add a controller to application to show samples of the a query
/* Clóvis */
app.controller('censoController', ['$scope', '$http', function sendData($scope, $http) {
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

app.controller('submitController',['$scope', '$http', function ($scope, $http) {
    //$scope.data = {};
    console.log('Chamou function submitController');
//    alert ('Chamou function submitController');
    $scope.submitQuery = function(){
        console.log('clicked submit');
        console.log($scope.parameters);
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
    $scope.submitGeraArquivo = function(){
        console.log('clicked submit Gera Arquivo');
        console.log($scope.parameters);
        $http({
            method: 'post',
            url: '/geraArq',
            data: $scope.parameters
        }).then(function(httpResponse){
            // this callback will be called asynchronously
            // when the response is available
            var result = httpResponse.data;
            console.log(result);
            var arrayX= JSON.parse (result)
            console.log (arrayX.output);
            $scope.dataFile = httpResponse.data;
            $scope.xyzw = arrayX.output;
            $scope.texto = "Clique para download";
//            console.log("Output: " + httpResponse.data.output);
            console.log('Arquivo gerado!');
            
        }, function(httpResponse) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.msg = 'Erro na geração do arquivo:('; 
        });
    }    
}]);

//Add a controller to App to show the list of Brazil's states
app.controller('ufsController', function($scope, $http) {
    console.log ('Run ufsController');
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
});

//Add a controller to App to show the census's years
app.controller('yearsController',['$scope', '$rootScope', listYears]);

function listYears($scope, $rootScope) {
    //$scope.data = [];
    // Modificar para obter anos do BD
    $scope.data = {
        model: null,
        years: [
            {codYear:'2010', year:'2010'},
            {codYear:'2000', year:'2000'}
        ]
    };          
    $scope.changeCenso = function () {
        objTabela = $scope.parameters;
        objParam = {params:objTabela};
        // Limpa a lsita de coleções (até descobrir como fazer isso no callFillTables)
        $rootScope.$broadcast ("callClearTables", objParam);
        // Preenche a lsita de coleções
        $rootScope.$broadcast ("callFillTables", objParam);
    }
};

//Add a controller to App to show the census's tables
app.controller('tablesController',['$scope', '$http', '$rootScope', listTables]);

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
        console.log(objTabela);
        objParam = {params:objTabela};
        console.log(objParam);
        console.log(objParam.params);
        $scope.$emit ("callFillVar", objParam);
    }

    $scope.$on ("callClearTables", function(event, data) {
        console.log ("callClearTables: " + data.params.ano);
        $scope.data = [];
        if (data.params.ano == 2000) {
            $scope.data = {
                model: null,
                tabelas: [
                    {codTabela:'', tabela:''},
                    {codTabela:'', tabela:''}
                ]
            };
        } else {
            $scope.data = {
                model: null,
                tabelas: [
                    {codTabela:'', tabela:''},
                    {codTabela:'', tabela:''},
                    {codTabela:'', tabela:''},
                    {codTabela:'', tabela:''}            
                ]
            };
        }
    });

    $scope.$on ("callFillTables", function(event, data) {
        console.log ("on callFillTables: " + data.params.ano);
        $scope.data = [];
//        $scope.data = [];
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
                    {codTabela:'mortalidade', tabela:'Mortalidade'},
                    {codTabela:'emigracao', tabela:'Emigração'},
                    {codTabela:'domicilio', tabela:'Domicilio'},
                    {codTabela:'pessoa', tabela:'Pessoa'}
                ]
            };
            break;
          default:
            break;
        }

        console.log ("$scope.parameters.tabela");
        console.log ($scope.parameters.tabela);
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
app.controller('variaveisController', function($scope, $rootScope, $http) {
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
        console.log ("callFillVar: " + data.params);
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

    $scope.preencheVar = function(){
        console.log('clicked preencheVar');
        alert ('clicked preencheVar');
        $http({
            method: 'get',
            url: '/variaveis',
//            data: $scope.parameters
        }).then(function(httpResponse){
            // this callback will be called asynchronously
            // when the response is available
            console.log('PreencheVAR: Query executed successfully!!!!!!!');
            //console.log(httpResponse);
            
        }, function(httpResponse) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.msg = 'Erro na execução da Query :('; 
        });
    }     
});

