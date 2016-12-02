window.Greekr = {};

Greekr.process = function (config, data) {

    if (!data) return;

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

                newRow[key] = hash.toString(CryptoJS.enc.Hex);
                break;

            case "raw":
                newRow[key] = row[key];
                break;

            }


        }

        return newRow;
    });

    return obfuscated;
};