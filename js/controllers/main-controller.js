angular.module('greekr').controller('MainController', function ($scope, localCsvService) {

    $scope.config = {
        salt: localStorage.getItem('greekr_salt'),
        rounds: localStorage.getItem('greekr_rounds'),
        cols: {},
        hashColumnName: {}
    };

    $scope.$watch('config.salt', function (value) {
        localStorage.setItem('greekr_salt', value);
    });
    $scope.$watch('config.rounds', function (value) {
        localStorage.setItem('greekr_rounds', value);
    });

    $scope.$watch('config', function () {
        updatePreview();
    }, true);

    function changeFile() {

        console.log('previewFile');

        var file = document.querySelector('input[type=file]').files[0];

        readCsvHead(file, 10, function (data) {
            $scope.data = data;
            $scope.keys = Object.keys(data[0]);

            $scope.keys.forEach(function (key) {
                $scope.config.hashColumnName[key] = true;
            });

            updatePreview(data);
            $scope.$apply();
        });
    }

    function updatePreview(data) {

        var worker = new Worker("greekr-worker.js");

        worker.onmessage = function (event) {
            console.log(event.data);
            $scope.obfuscatedData = event.data.data;
            $scope.processedColumnNames = event.data.processedColumnNames;
            $scope.$apply();
        };
        worker.postMessage({
            command: 'obfuscate',
            config: $scope.config,
            data: $scope.data
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


    $scope.configColumn = function (key, arg) {
        $scope.config.cols[key] = arg;
    };

    $scope.obfuscate = function () {

        var file = document.querySelector('input[type=file]').files[0];

        var worker = new Worker("greekr-worker.js");

        worker.onmessage = function (event) {
            console.log(event);
        };
        worker.postMessage({
            command: 'process_csv',
            config: $scope.config,
            file: file
        });

    }

    $scope.saveFileTest = function () {
        var worker = new Worker("greekr-worker.js");

        worker.onmessage = function (message) {

            console.log(message);
            
            switch (message.data.type) {
            case 'complete':
                console.log(message.data.url)
                document.location.href = message.data.url;
                break;

            case 'error':
                navigator.webkitTemporaryStorage.queryUsageAndQuota(
                    function (usedBytes, grantedBytes) {
                        console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
                    },
                    function (e) {
                        console.log('Error', e);
                    }
                );


                var requestedBytes = 1024 * 1024 * 280;

                navigator.webkitPersistentStorage.requestQuota(
                    requestedBytes,
                    function (grantedBytes) {
                        console.log('we were granted ', grantedBytes, 'bytes');

                    },
                    function (e) {
                        console.log('Error', e);
                    }
                );

                break;
            }


        };
        worker.postMessage({
            command: 'test_save_file'
        });
    };

    window.onload = function () {
        console.log('onload');
        document.getElementById('csv_file').addEventListener("change", changeFile);
    };

});