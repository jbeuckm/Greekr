chrome.browserAction.onClicked.addListener(function (tab) {

    chrome.browserAction.onClicked.addListener(function (activeTab) {
        var newURL = "prepare.html";
        chrome.tabs.create({
            url: newURL
        });
    });

});