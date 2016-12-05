importScripts('bower_components/papaparse/papaparse.min.js', 'greekr.js');
importScripts('bower_components/cryptojslib/rollups/md5.js');
importScripts('bower_components/cryptojslib/components/enc-base64-min.js');

self.onmessage = function (msg) {

    switch (msg.data.command) {

        case 'csv_head':
            readCsvHead(msg.data.file);
            break;
            
        case 'obfuscate':
            obfuscateData(msg.data.data, msg.data.config);
            break;            
    }
};


function obfuscateData(data, config) {    
    var results = Greekr.process(config, data);
    self.postMessage({
        type: 'obfuscate',
        data: results.data,
        processedColumnNames: results.processedColumnNames
    });
}


function postResults(type, data) {
    self.postMessage({
        type: type,
        data: data
    });
}

function readCsvHead(file, lines) {

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
                    
                    postResults("csv_head", data);
                }
            }

        });

    }
    
    r.readAsText(file);
}