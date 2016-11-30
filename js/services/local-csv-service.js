angular.module('greekr').factory('localCsvService', function ($q) {

    return {
        parseFile: function (file) {

            var def = $q.defer();

            var r = new FileReader();

            r.addEventListener("error", function (err) {
                console.error(err);
                def.reject(err);
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

                            def.resolve(data);
                        }
                    }

                });

            }
            r.readAsText(file);

            return def.promise;

        }
    };

});
