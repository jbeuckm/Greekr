angular.module('greekr').factory('obfuscateService', function () {

    return {
        process: function (config, data) {
            
            if (!data) return;

            var obfuscated = data.map(function (row) {

                var newRow = {};

                for (var key in config.cols) {
                    
                    newRow[key] = 'hi';

                    var hash = CryptoJS.MD5("Message");
                    console.log(hash.toString(CryptoJS.enc.Base64));

                }

                return newRow;
            });

            return obfuscated;
        }
    };

})