function openPrepareTab() {
    var newURL = "prepare.html";
    chrome.tabs.create({
        url: newURL
    });
}

function unhashPage() {
    
}

document.addEventListener('DOMContentLoaded', function () {
    
    var prepareButton = document.getElementById('prepare-data');
    prepareButton.addEventListener('click', openPrepareTab);
    
    var unhashButton = document.getElementById('unhash-page');
    unhashButton.addEventListener('click', unhashPage);

});


