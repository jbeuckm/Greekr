angular.module('greekr').controller('MainController', function ($scope, localCsvService, $indexedDB) {

    function updateDbCount() {
        $indexedDB.openStore('hashes', function (store) {

            store.count().then(function (e) {
    console.log(e);
                $scope.dbCount = e;
            });
        });
    }

    console.log('updateDbCount()');
    updateDbCount();
    
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
                $scope.config.cols[key] = 'drop';
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

        if ($scope.obfuscatingWorker) {
            $scope.obfuscatingWorker.terminate();
        }

        var file = document.querySelector('input[type=file]').files[0];

        var worker = new Worker("greekr-worker.js");
        $scope.obfuscatingWorker = worker;

        worker.onmessage = function (message) {

            switch (message.data.type) {

            case 'complete':
                $scope.obfuscatingWorker = null;

                var modal = document.getElementById('myModal');
                var span = document.getElementsByClassName("close")[0];


                span.onclick = function () {
                    modal.style.display = "none";
                }
                window.onclick = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }

                $scope.obfuscated_csv_path = message.data.url;
                $scope.obfuscated_csv_name = message.data.url.split('/').pop();

                modal.style.display = "block";

                $scope.$apply();

                break;

            case 'progress':
                updateDbCount();
                $scope.obfuscateProgress += message.data.rows;
                $scope.$apply();
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

        $scope.obfuscateProgress = 0;

        worker.postMessage({
            command: 'process_csv',
            config: $scope.config,
            file: file
        });

    }


    window.onload = function () {
        console.log('onload');
        document.getElementById('csv_file').addEventListener("change", changeFile);
    };

});