function openPrepareTab() {
    var newURL = "prepare.html";
    chrome.tabs.create({
        url: newURL
    });
}

document.addEventListener('DOMContentLoaded', function () {
    
    var prepareButton = document.getElementById('prepare-data');
    console.log(prepareButton);
    prepareButton.addEventListener('click', openPrepareTab);

});


