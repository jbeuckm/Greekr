angular.module('greekr').controller('MainController', function ($scope, localCsvService) {

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
        //        $scope.obfuscatedData = Greekr.process($scope.config, $scope.data);
    }, true);

    function changeFile() {

        console.log('previewFile');

        var file = document.querySelector('input[type=file]').files[0];

        readCsvHead(file, 10, function(data){
            $scope.data = data;
            $scope.keys = Object.keys(data[0]);
            console.log('got keys '+$scope.keys)
            updatePreview(data);
            $scope.$apply();
        });
    }
    
    function updatePreview(data) {
        
        var worker = new Worker("greekr-worker.js");

        worker.onmessage = function (event) {
            console.log('event from worker')
            console.log(event.data)
            $scope.obfuscatedData = event.data.data;
        };
        worker.postMessage({
            command: 'obfuscate',
            config: $scope.config,
            data: data
        });

    }

    function readCsvHead(file, lines, callback) {

        var r = new FileReader();

        r.addEventListener("error", function (err) {
            console.error(err);
        });

        r.onload = function (e) {
            var csv = e.target.result;

            var data = [];

            Papa.parse(csv, {
                header: true,

                step: function (results, parser) {
                    data.push(results.data[0]);

                    if (data.length == lines) {
                        parser.abort();

                        callback(data);
                    }
                }

            });

        }

        r.readAsText(file);
    }


    $scope.dropColumn = function (key) {
        $scope.config.cols[key] = 'drop';
    }

    $scope.obfuscate = function () {
        var file = document.querySelector('input[type=file]').files[0];

        var worker = new Worker("greekr-worker.js");

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
        document.getElementById('csv_file').addEventListener("change", changeFile);
    };


});