// This runs in the context of the webpage to unhash

var hashRegexp = /([a-f0-9]{32})/i;


var all = getElementsWithNoChildren().filter(function (el) {
    return (el.offsetParent !== null);
});

console.log("will search " + all.length + " elements");

for (var i = 0, max = all.length; i < max; i++) {
    var el = all[i];

    if (el.innerHTML.match(hashRegexp)) {
        attemptUnhash(el);
    }
}

var ExtensionId = "cbjpopohmpnpenplajjnnlgenodmieho";


function attemptUnhash(el) {
    var hash = el.textContent;

    chrome.runtime.sendMessage(ExtensionId, { hash: hash }, {},
        function (result) {
            console.log("unhash received decoded value "+result);
//            el.innerHTML = '<span class="replaced">' + result + '<\/span>';
        }
    );

}


function getElementsWithNoChildren(data) {

    var candidates, numberOfChildren, i, len, result = [];

    // Checking for weird input and applying nice default behavior...
    if (data && typeof data === "object") {
        if (data.length) {
            if (data.length > 0) {
                // looks like an array, so assume it contains elements...
                candidates = data;
            } else {
                // looks like an empty array, so return the default result...
                return result;
            }
        } else {
            // It's an object, but not array-like, so assume it's an element...
            candidates = data.querySelectorAll('*');
        }
    } else {
        // Default if no arguments or weird ones are passed in...
        candidates = window.document.querySelectorAll('*');
    }

    len = candidates.length;
    if (len > 0) {
        for (i = 0; i < len; i = i + 1) {
            numberOfChildren = candidates[i].children.length;
            if (numberOfChildren === 0) {
                result.push(candidates[i]);
            }
        }
    }

    return result;
};