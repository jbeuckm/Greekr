var hashRegexp = /([a-f0-9]{32})/i;


var all = getElementsWithNoChildren().filter(function(el){
    return (el.offsetParent !== null);
});

for (var i=0, max=all.length; i < max; i++) {
    var el = all[i];
    console.log(el.innerHTML);
    if (el.innerHTML.match(hashRegexp)) {
        alert(el.innerHTML)
    }
    el.innerHTML = el.textContent.replace(hashRegexp, '<b class="replaced">$1<\/b>');
}





function getElementsWithNoChildren(data) {

    // This function is designed to find the most bottom level
    // elements in the DOM tree, anything without children

    var candidates, numberOfChildren, i, len, result = [];

    // Checking for weird input and applying nice default behavior...
    if (data && typeof data === "object") {
        if (data.length) {
            if (data.length > 0) {
                // looks like an array, so assume it contains elements...
                candidates = data;
            }
            else {
                // looks like an empty array, so return the default result...
                return result;
            }
        }
        else {
            // It's an object, but not array-like, so assume it's an element...
            candidates = data.querySelectorAll('*');
        }
    }
    else {
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