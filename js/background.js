
chrome.browserAction.onClicked.addListener(function(tab) {
/*    
  chrome.tabs.executeScript({
    file: 'unhash.js'
  });
*/    
chrome.browserAction.onClicked.addListener(function(activeTab){
  var newURL = "popup.html";
  chrome.tabs.create({ url: newURL });
});
    
    
});
