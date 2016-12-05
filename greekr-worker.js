importScripts('bower_components/papaparse/papaparse.min.js', 'greekr.js');


self.onmessage = function (msg) {

    switch (msg.data.command) {
    case 'start':
        obfuscateFile(msg.data.file, msg.data.config);
        break;
    }
    console.log(msg.data);
};


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
        self.postMessage(processed);
    });

}


function readCsvHead(file, callback) {

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

                if (data.length == 10) {
                    parser.abort();                    
                    
                    callback(data);
                }
            }

        });

    }
    r.readAsText(file);

}