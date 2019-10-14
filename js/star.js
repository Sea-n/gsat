var favStorageName = "favoritesStar";
var gsatYear = "108";
var gsatType = "star";

var filterAdv = {
	"國文": 0,
	"英文": 0,
	"數學": 0,
	"社會": 0,
	"自然": 0
};
var subjectsAdv = Object.keys(filterAdv);

var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/data-star?v=0227', false);
xhr.send(null);
var lines = xhr.response.split('\n');

var data = [];
var lc = {};
for (var i=0; i<lines.length; i++) {
	var line = lines[i].split('\t');
	datum = {
		id: line[0],
		gsat: line[1].split(""),
		school: line[3],
		name: line[4]
	};

	var adv = line[2].split(" ");
	for (var k = 0; k < subjectsAdv.length; k++)
		datum[ subjectsAdv[k] ] = adv[k];

	if (lc[datum.name] === undefined)
		lc[datum.name] = 1;
	else
		lc[datum.name]++;

	data.push(datum);
}

var list = Object.keys(lc).sort(function(a, b) {
	return lc[a] < lc[b];
});

function getDetailLink(id) {
	return 'https://www.cac.edu.tw/star108/system/108ColQry_forstar_5d3o9a/html/108_' + id + '.htm';
}
