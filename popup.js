

angular.module('greekr', []).run(function(){
    
function previewFile() {
    console.log('previewFile');

    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    reader.addEventListener("error", console.error);

    reader.addEventListener("load", function () {
        console.log(reader.result);
    }, false);

    if (file) {
        reader.readAsDataURL(file);
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