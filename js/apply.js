var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/data-apply', false);
xhr.send(null);
var data = JSON.parse(xhr.response);
