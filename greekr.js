var Greekr = {};

var db, objectStore;

function initDB(callback) {
    
    if (db) {
        return callback(db);
    }
    var request = indexedDB.open("greekr");
    request.onerror = console.error;
    request.onsuccess = function (event) {
        db = event.target.result;
        callback(db);
    };
    request.onupgradeneeded = function (event) {
        console.log('onupgradeneeded');
        db = event.target.result;
        objectStore = db.createObjectStore("hashes", {
            keyPath: "hash"
        });
    };
}

function insertRecord(hash, value) {
    var transaction = db.transaction(["hashes"], "readwrite");
    transaction.oncomplete = function (event) {
        console.log("transaction.oncomplete");
    };

    transaction.onerror = console.log;

    var objectStore = transaction.objectStore("hashes");
        var request = objectStore.add({ hash: hash, value: value});
        request.onsuccess = console.log;
}

Greekr.process = function (config, data, callback) {
    console.log('process')
    if (!data) {
        console.log('no data');
        return;
    }
    initDB(function(){
        console.log('db initted');
        var result = executeObfuscation(config, data);
        callback(result);
    });
}
    
function executeObfuscation(config, data) {    
    console.log('executeObfuscation');
    var processedColumnNames = {};
    Object.keys(data[0]).forEach(function(key){
        
        if (config.hashColumnName[key]) {
            var hash = key + config.salt;

            var rounds = parseInt(config.rounds);
            for (var i = 0; i < rounds; i++) {
                hash = CryptoJS.MD5(hash);
            }

            processedColumnNames[key] = hash.toString(CryptoJS.enc.Hex);
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
                    insertRecord(hashString, row[key]);
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
