angular.module('greekr').controller('MainController', function ($scope, localCsvService) {

    
    var db = null;

    function initDB() {
        
        console.log("MainController: initDB() ");
            
        var request = indexedDB.open("greekr", 1);
        
        request.onsuccess = function (event) {
            console.log('initDB success');
            db = request.result;
            updateDbCount();
        };

        request.onblocked = function(e) {
          console.log("DB open blocked", e);
        };
        
        request.onerror = function (event) {
            console.log("Failed to authorize indexedDB");
        };
        request.onupgradeneeded = function (event) {
            console.log('onupgradeneeded');
            db = event.target.result;
            var objectStore = db.createObjectStore("hashes", {
                keyPath: "hash"
            });
        };
       
        console.log("initDB ran");
    }

    $scope.clearDb = function () {
        console.log('clearDb()');
        
        var transaction = db.transaction("hashes", "readwrite");
        var objectStore = transaction.objectStore("hashes");
        var request = objectStore.clear();
        request.onerror = function(e) {
            console.log(e);
        };
        request.onsuccess = function (event) {
            console.log("db cleared");
            updateDbCount();
        };
    }

    function updateDbCount() {
        console.log('updateDbCount()');

        var transaction = db.transaction("hashes", "readonly");
        var objectStore = transaction.objectStore("hashes");
        var request = objectStore.count();
        request.onerror = function(e) {
            console.log(e);
        };
        request.onsuccess = function (event) {
            console.log("counted: "+event.target.result);
            $scope.dbCount = event.target.result;
            $scope.$apply();
        };

    }


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
            $scope.previewData = data;
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

        var previewConfig = JSON.parse(JSON.stringify($scope.config));
        previewConfig.skipDatabase = true;
        worker.postMessage({
            command: 'obfuscate',
            config: previewConfig,
            data: $scope.previewData
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
                $scope.obfuscateProgress += message.data.rows;
                updateDbCount();
                break;


            case 'obfuscate_progress':
                console.log('obfuscate_progress event');
                updateDbCount();
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
/*
        window.onunload = function() {
            worker.terminate();
        };
*/        
    }


    window.onload = function () {
        console.log('onload');
        document.getElementById('csv_file').addEventListener("change", changeFile);

        initDB();
    };

});