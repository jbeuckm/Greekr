angular.module('greekr').controller('MainController', function ($scope, localCsvService) {

    function previewFile() {
        
        console.log('previewFile');

        var f = document.querySelector('input[type=file]').files[0];
        
        if (f) {
            localCsvService.parseFile(f).then(function(data){
                console.log(data);
                
                $scope.keys = Object.keys(data[0]);
                $scope.data = data;
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