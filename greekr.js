var Greekr = {};
console.log("Using Greekr");

var ExtensionId = "cbjpopohmpnpenplajjnnlgenodmieho";



Greekr.unhash = function (hash, callback) {

    chrome.runtime.sendMessage(
        ExtensionId, 
        { 
            type: "retrieve_value", 
            hash: hash
        }, {},
        function(response) {
            console.log('response:');
            console.log(response);
        }
    );
    
};

/*
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
*/

function saveRecord(hash, value) {
    // tell host app to save record to extension db
    self.postMessage({
        type: 'save_record',
        hash: hash, 
        value: value
    });
}

Greekr.process = function (config, data, callback, progressCallback) {
    console.log('process')
    if (!data) {
        console.log('no data');
        return;
    }

    var result = executeObfuscation(config, data, progressCallback);
    callback(result);
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
                saveRecord(hashString, key);
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
                    saveRecord(hashString, row[key]);
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