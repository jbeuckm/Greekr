importScripts('bower_components/papaparse/papaparse.min.js');

console.log('hi from worker');


self.onmessage = function (msg) {

    switch (msg.data.command) {
    case 'start':
        obfuscateFile(msg.data.file, msg.data.config);
        break;
    }
    console.log(msg.data);
};


function obfuscateFile(file, config) {

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
                    self.postMessage('parsed csv');
                }
            }

        });

    }
    r.readAsText(file);

}