angular.module('greekr').controller('MainController', function ($scope, localCsvService, obfuscateService) {
    
    $scope.config = {
        salt: localStorage.getItem('greekr_salt'),
        rounds: localStorage.getItem('greekr_rounds'),
        cols: {}
    };
    
    $scope.$watch('config.salt', function(value){
        localStorage.setItem('greekr_salt', value);
    });
    $scope.$watch('config.rounds', function(value){
        localStorage.setItem('greekr_rounds', value);
    });
    
    $scope.$watch('config', function(){
        $scope.obfuscatedData = obfuscateService.process($scope.config, $scope.data);
    }, true);

    function previewFile() {
        
        console.log('previewFile');

        var f = document.querySelector('input[type=file]').files[0];
        
        if (f) {
            localCsvService.parseFile(f).then(function(data){
                console.log(data);
                
                $scope.keys = Object.keys(data[0]);
                $scope.data = data;
                
                $scope.obfuscatedData = obfuscateService.process($scope.config, data);
            });
        }
    }

    function obfuscate() {
        alert('obfuscate')
    }

    window.onload = function () {
        console.log('onload');
        document.getElementById('csv_file').addEventListener("change", previewFile);
        document.getElementById('obfuscate').addEventListener("click", obfuscate);
    };


});