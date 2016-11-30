angular.module('greekr', []).run(function (localCsvService) {

    function previewFile() {
        
        console.log('previewFile');

        var f = document.querySelector('input[type=file]').files[0];
        
        if (f) {
            localCsvService.parseFile(f).then(console.log);
        }
    }

    function obfuscate() {
        alert('obfuscate')
    }

    window.onload = function () {
        console.log('onload');
        document.getElementById('csv_file').addEventListener("change", previewFile);
        document.getElementById('obfuscate').addEventListener("click", obfuscate);
    };


});