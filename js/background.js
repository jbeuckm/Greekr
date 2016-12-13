chrome.runtime.onMessage.addListener(
    
    function (request, sender, sendResponse) {
        console.log('message received in background.js');
        console.log(request);
    
        sendResponse({msg:'hi from background.js'});
    }
);


