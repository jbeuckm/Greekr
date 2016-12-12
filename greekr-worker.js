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

/*
console.log = self.postMessage;
console.error = self.postMessage;
*/

function obfuscateData(data, config) {
    if (!data) return;
    Greekr.process(config, data, function (results) {

        self.postMessage({
            type: 'obfuscate',
            data: results.data,
            processedColumnNames: results.processedColumnNames
        });
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

function processCSV(file, config) {

    var processed = [];

    Papa.parse(file, {
        header: true,
        chunk: function (chunk) {
            Greekr.process(config, chunk.data, function (processedChunk) {

                processed = processed.concat(processedChunk.data);

                self.postMessage({
                    type: "progress",
                    rows: chunk.data.length
                });
            });

        },
        complete: function (results) {
            console.log("will save...")

            var filename = file.name.split('.');
            filename.splice(filename.length - 1, 0, 'obfuscated');
            filename = filename.join('.');

            console.log(filename)
            saveCsvFile(processed, filename);
        }
    });
}


function saveCsvFile(data, filename) {

    self.requestFileSystemSync = self.webkitRequestFileSystemSync ||
        self.requestFileSystemSync;

    try {
        var fs = requestFileSystemSync(TEMPORARY, 1024 * 1024 /*1MB*/ );

        postMessage('Got file system.');

        var fileEntry = fs.root.getFile(filename, {
            create: true,
            exclusive: false
        });

        postMessage('Got file entry.');

        var str = new CSV(data, {
            header: true
        }).encode();
        var blob = new Blob([str], {
            type: 'text/csv'
        });

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

        self.postMessage({
            type: 'error',
            error: e
        });
    }

}