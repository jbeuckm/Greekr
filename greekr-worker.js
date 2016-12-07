importScripts('bower_components/papaparse/papaparse.min.js', 'greekr.js');
importScripts('bower_components/cryptojslib/rollups/md5.js');
importScripts('bower_components/cryptojslib/components/enc-base64-min.js');
importScripts('bower_components/comma-separated-values/csv.min.js');

self.onmessage = function (msg) {

    switch (msg.data.command) {

    case 'csv_head':
        readCsvHead(msg.data.file);
        break;

    case 'obfuscate':
        obfuscateData(msg.data.data, msg.data.config);
        break;

    case "process_csv":
        processCSV(msg.data.file, msg.data.config);
        break;

    }
};


function processCSV(file, config) {

    var processed = [];

    Papa.parse(file, {
        header: true,
        chunk: function (chunk) {
            var processedChunk = Greekr.process(config, chunk.data);

            processed = processed.concat(processedChunk.data);

            self.postMessage({
                type: "process_csv",
                message: 'chunk size ' + chunk.data.length
            });
        },
        complete: function (results) {            
            console.log(processed);
            saveCsvFile(processed);
        }
    });
}


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


function saveCsvFile(data) {

    self.requestFileSystemSync = self.webkitRequestFileSystemSync ||
        self.requestFileSystemSync;
    
    try {
        var fs = requestFileSystemSync(TEMPORARY, 1024 * 1024 /*1MB*/ );

        postMessage('Got file system.');

        var fileEntry = fs.root.getFile("test_out2.csv", {
            create: true
        });

        postMessage('Got file entry.');

        var str = new CSV(data, { header: true }).encode();
        var blob = new Blob([str], {type : 'text/csv'});

        try {
            postMessage('Begin writing');
            fileEntry.createWriter().write(blob);
            postMessage('Writing complete');
            postMessage({
                type: 'complete',
                url: fileEntry.toURL()
            });
        } catch (e) {
            console.error(e);
            self.postMessage({
                type: 'error',
                error: e
            });
        }

    } catch (e) {
        console.log(e);
        console.error(e);
        
        self.postMessage({type:'error',error:e});
    }

}


