var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/data-apply', false);
xhr.send(null);
var data = JSON.parse(xhr.response);

var lc = {};
for (var i = 0, len = data.length; i < len; i++) {
	data[i].school = school[data[i].id.substr(0, 3)];

    if (lc[data[i].name] === undefined)
        lc[data[i].name] = 1;
    else
        lc[data[i].name]++;
}

var list = Object.keys(lc).sort(function(a, b) {
    return lc[a] < lc[b];
});

parseHash();
document.getElementById("loading").style.display = "none";
