var db = null;

function initDB(callback) {

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


var recordQueue = [];
var busy = false;

function saveNextRecord() {
    
    if (recordQueue.length == 0) return;
    if (busy) return;
    busy = true;
    
    
    var transaction = db.transaction("hashes", "readwrite");
    transaction.oncomplete = function() {
        console.log('transaction.oncomplete()');
        busy = false;
        saveNextRecord();
    };

    var record = recordQueue.shift();
    var request = transaction.objectStore("hashes").put(record);
    
    request.onerror = function(e){
        console.log('request.onerror()');
        console.error(e);
    }
}
function queueRecord(record) {
    recordQueue.push(record);
    saveNextRecord();
}

chrome.runtime.onMessage.addListener(

    function (request_object, sender, sendResponse) {

//        initDB(function () {

            switch (request_object.type) {

            case 'store_record':
                queueRecord(request_object.record);
                break;
                    
            case 'retrieve_value':
                var hashString = request_object.hash;
                    console.log('will query '+hashString);
                var transaction = db.transaction("hashes", "readonly");
                var request = transaction.objectStore("hashes").get(hashString);
                request.onerror = function(response){
                    console.error(response);
                    sendResponse(response);
                };
                request.onsuccess = function(response){
                    console.log(response);
                    sendResponse(request.result);
                };
                break;
                    
            case 'count_records':
                var transaction = db.transaction("hashes", "readonly");
                var objectStore = transaction.objectStore("hashes");
                var request = objectStore.count();
                request.onerror = function(response){
                    console.log(response);
                    sendResponse(response);
                };
                request.onsuccess = function(response){
                    sendResponse(request.result);
                };
                break;
                    
            case 'clear_db':
                var transaction = db.transaction("hashes", "readwrite");
                var objectStore = transaction.objectStore("hashes");
                var request = objectStore.clear();
                request.onerror = sendResponse;
                request.onsuccess = sendResponse;                    
                break;
            }

//        });

        return true;
    }
);


initDB(console.log);
