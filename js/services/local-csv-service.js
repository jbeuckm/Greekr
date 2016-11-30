angular.module('greekr').factory('localCsvService', function(){
    
   return {
       parseFile: function(file) {
            var r = new FileReader();

            r.addEventListener("error", console.error);

            r.onload = function (e) {
                var csv = e.target.result;
                var parseResult = Papa.parse(csv, { header: true });
                
                return parseResult.data;
            }
            r.readAsText(file);
           
       }
   };
   
});