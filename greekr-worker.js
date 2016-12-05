importScripts('bower_components/papaparse/papaparse.min.js', 'greekr.js');


self.onmessage = function (msg) {

    switch (msg.data.command) {

        case 'csv_head':
            readCsvHead(msg.data.file);
            break;
            
        case 'obfuscate':
            obfuscateData(msg.data.data, msg.data.config);
            break;
            
        case 'obfuscate_file':
            obfuscateFile(msg.data.file, msg.data.config);
            break;
    }
    console.log(msg.data);
};


function obfuscateData(data, config) {    
    var processed = Greekr.process(config, data);
    postResults('obfuscate', processed);
}


function obfuscateFile(file, config) {
    
    readCsvHead(file, function(data){
        
        config.cols = {};
        Object.keys(data[0]).forEach(function(key){
            config.cols[key] = 'raw';
        })
        
        console.log('will process');
        console.log(config);
        var processed = Greekr.process(config, data);
        console.log(processed);
        
        postResults('obfuscate', {});
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