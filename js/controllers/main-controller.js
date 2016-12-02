angular.module('greekr').controller('MainController', function ($scope, localCsvService, obfuscateService) {

    $scope.config = {
        salt: localStorage.getItem('greekr_salt'),
        rounds: localStorage.getItem('greekr_rounds'),
        cols: {}
    };

    $scope.$watch('config.salt', function (value) {
        localStorage.setItem('greekr_salt', value);
    });
    $scope.$watch('config.rounds', function (value) {
        localStorage.setItem('greekr_rounds', value);
    });

    $scope.$watch('config', function () {
        $scope.obfuscatedData = obfuscateService.process($scope.config, $scope.data);
    }, true);

    function previewFile() {

        console.log('previewFile');

        var f = document.querySelector('input[type=file]').files[0];

        if (f) {
            localCsvService.parseFile(f).then(function (data) {
                console.log(data);

                $scope.keys = Object.keys(data[0]);
                $scope.keys.forEach(function (key) {
                    $scope.config.cols[key] = 'raw';
                });
                $scope.data = data;

                $scope.obfuscatedData = obfuscateService.process($scope.config, data);
            });
        }
    }

    $scope.dropColumn = function (key) {
        $scope.config.cols[key] = 'drop';
    }

    $scope.obfuscate = function () {
        var file = document.querySelector('input[type=file]').files[0];

        var worker = new Worker("worker.js");
        worker.onmessage = function (event) {
            alert(event.data);
        };
        worker.postMessage({
            command: 'start',
            config: $scope.config,
            file: file
        });
    }

    window.onload = function () {
        console.log('onload');
        document.getElementById('csv_file').addEventListener("change", previewFile);
        //        document.getElementById('obfuscate').addEventListener("click", obfuscate);
    };


});