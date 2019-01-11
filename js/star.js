var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/data-star', false);
xhr.send(null);
var data = JSON.parse(xhr.response);
