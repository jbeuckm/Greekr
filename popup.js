function openPrepareTab() {
    var newURL = "prepare.html";
    chrome.tabs.create({
        url: newURL
    });
}

function unhashPage() {
    
  chrome.tabs.executeScript({
    file: 'greekr.js'
  });
  chrome.tabs.executeScript({
    file: 'unhash.js'
  });

}

document.addEventListener('DOMContentLoaded', function () {
    
    var prepareButton = document.getElementById('prepare-data');
    prepareButton.addEventListener('click', openPrepareTab);
    
    var unhashButton = document.getElementById('unhash-page');
    unhashButton.addEventListener('click', unhashPage);

});


