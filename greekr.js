var Greekr = {};

Greekr.process = function (config, data) {

    if (!data) return;
    
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

                newRow[processedColumnNames[key]] = hash.toString(CryptoJS.enc.Hex);                    
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
