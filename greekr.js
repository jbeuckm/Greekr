var Greekr = {};

var db = null;

function initDB(callback) {

    console.log('greekr: initDB()');

    if (db) {
        return callback(db);
    }
    var request = indexedDB.open("greekr", 1);
    request.onerror = function (e) {
        console.error('error in initDB');
    }
    request.onsuccess = function (event) {
        console.log('initDB success');
        db = request.result;
        callback(db);
    };
    request.onupgradeneeded = function (event) {
        console.log('onupgradeneeded');
        db = event.target.result;
        var objectStore = db.createObjectStore("hashes", {
            keyPath: "hash"
        });
    };
}


var queuedRecords = [];
var transaction;

function queueRecord(hash, value, progressCallback) {

    queuedRecords.push({
        hash: hash,
        value: value
    });

    nextRecord(progressCallback);
}

function nextRecord(progressCallback) {

    if (transaction != null) return;

    if (queuedRecords.length == 0) return;

    transaction = db.transaction("hashes", "readwrite");

    transaction.oncomplete = function (event) {
        transaction = null;
        if (progressCallback) {
            progressCallback('complete');
        }
        nextRecord(progressCallback);
    };

    transaction.onerror = function (event) {
        console.error(event);
        if (progressCallback) {
            progressCallback('error');
        }
        nextRecord(progressCallback);
    };

    var record = queuedRecords.shift();
    var request = transaction.objectStore("hashes").put(record);

}


Greekr.process = function (config, data, callback, progressCallback) {
    console.log('process')
    if (!data) {
        console.log('no data');
        return;
    }
    initDB(function () {
        console.log('db initted');
        var result = executeObfuscation(config, data, progressCallback);
        callback(result);
    });
}

function executeObfuscation(config, data, progressCallback) {
    console.log('executeObfuscation');
    var processedColumnNames = {};
    Object.keys(data[0]).forEach(function (key) {

        if (config.hashColumnName[key]) {
            var hash = key + config.salt;

            var rounds = parseInt(config.rounds);
            for (var i = 0; i < rounds; i++) {
                hash = CryptoJS.MD5(hash);
            }

            var hashString = hash.toString(CryptoJS.enc.Hex);
            processedColumnNames[key] = hashString;

            if (!config.skipDatabase) {
                queueRecord(hashString, key, progressCallback);
            }
        
        } else {
            processedColumnNames[key] = key;
        }

    });

    var obfuscated = data.map(function (row) {

        var newRow = {};

        for (var key in config.cols) {

            switch (config.cols[key]) {

            case "hash":
                var hash = row[key] + config.salt;

                var rounds = parseInt(config.rounds);
                for (var i = 0; i < rounds; i++) {
                    hash = CryptoJS.MD5(hash);
                }

                var hashString = hash.toString(CryptoJS.enc.Hex);
                newRow[processedColumnNames[key]] = hashString;

                if (!config.skipDatabase) {
                    queueRecord(hashString, row[key], progressCallback);
                }

                break;

            case "raw":
                newRow[processedColumnNames[key]] = row[key];
                break;

            }

        }

        return newRow;
    });

    return {
        processedColumnNames: processedColumnNames,
        data: obfuscated
    };
};