angular.module('greekr').factory('obfuscateService', function () {

    return {
        process: function (config, data) {

            if (!data) return;

            var obfuscated = data.map(function (row) {

                var newRow = {};

                for (var key in config.cols) {

                    switch (config.cols[key]) {

                    case "drop":
                        break;

                    case "hash":
                        var hash = CryptoJS.MD5(row[key]);
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
        }
    };

})