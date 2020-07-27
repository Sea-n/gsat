/* Search Engine Robot */
if (/googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator/i.test(navigator.userAgent)) {
	document.getElementById("loading").style.display = "none";
	throw new Error('Use static page for Search Engines');
}


/* Default Varibles */
var default_max_result = 20;
var max_result = default_max_result; // max count for result


/* GSAT Filters */
var markLables = [ "未選考", "底標", "後標", "均標", "前標", "頂標", "未設定" ];
var markClasses = [ "negative", "info", "info", "primary", "positive", "positive", "" ];
var filterGsat = {
	"國文": 6,
	"英文": 6,
	"數學": 6,
	"社會": 6,
	"自然": 6,
};
var subjectsGsat = Object.keys(filterGsat);

var filterAdv = {
	"國文": 0,
	"英文": 0,
	"數學": 0,
	"社會": 0,
	"自然": 0
};
if (gsatType == "advanced")
	var filterAdv = {
		"國文": 0,
		"英文": 0,
		"數甲": 0,
		"數乙": 0,
		"物理": 0,
		"化學": 0,
		"生物": 0,
		"歷史": 0,
		"地理": 0,
		"公民": 0
	};

var subjectsAdv = Object.keys(filterAdv);

var starResults = {};


/* Countdown GSAT */
var countdownG = document.getElementById("countdownG");
if (countdownG !== null)
    countdownG.innerHTML = Math.ceil((1579190400000 - new Date().getTime()) / 1000 / 60 / 60 / 24);

/* Countdown Advanced */
var countdownA = document.getElementById("countdownA");
if (countdownA !== null)
    countdownA.innerHTML = Math.ceil((1593705600000 - new Date().getTime()) / 1000 / 60 / 60 / 24);


const CJK = new RegExp('[a-zA-Z\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]'); // from pangu, CJK + Alphabet


/* Get Table Data */
var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/' + gsatYear + '/' + gsatType, false);
xhr.send(null);
var lines = xhr.response.split('\n');

var data = [];
var lc = {};
for (var line of lines) {
	if (line.length == 0)
		continue;
	line = line.split('\t');
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

	if (gsatType == 'star') {
		if (! (datum.school in starResults))
			starResults[datum.school] = {};

		if (! (datum.name in starResults[datum.school]))
			starResults[datum.school][datum.name] = {
				count: 0
			};
	}

	data.push(datum);
}

/* Count Frequency */
var depList = Object.keys(lc);

depList.sort(function(a, b) {
	return lc[a] < lc[b];
});

var suggestionList = depList.filter(dep => lc[dep] > 1);


/* Get star history data */
if (gsatType === 'star') {
	for (var y = 103; y <= 108; y++) {
		fetchStarResults(y);
	}
}

/* star float table */
if (gsatType === 'star') {
	var floatWindow = document.getElementById('starFloat');
	window.addEventListener('click', function(event) {
		if (event.target == floatWindow) {
			floatWindow.style.display = 'none';
			document.body.style.overflow = 'auto';
		}
	});

	window.addEventListener('keydown', function(event) {
		if (event.key === 'Escape' || event.keyCode === 27) {
			floatWindow.style.display = 'none';
			document.body.style.overflow = 'auto';
		}
	});

	var span = document.getElementsByClassName("close")[0];
	span.onclick = function() {
		floatWindow.style.display = 'none';
		document.body.style.overflow = 'auto';
	};
}



if (localStorage.getItem("gsatMarks"))
	filterGsat = JSON.parse(localStorage.getItem("gsatMarks"));

for (var subj in filterGsat)
	if (filterGsat[subj] !== 6) {
		document.getElementById("filterGsat").parentNode.open = true;
		break;
	}


/* Backward Compatibility before 13 Oct 2019 */
if (localStorage.getItem("favoritesApply")) {
	old = JSON.parse(localStorage.getItem("favoritesApply"));
	localStorage.removeItem("favoritesApply");

	old.sort();
	var favs = old.filter((val, idx, arr) => {
		return val !== 0;
	});
	localStorage.setItem("favs108apply", JSON.stringify(favs));
}

if (localStorage.getItem("favoritesStar")) {
	old = JSON.parse(localStorage.getItem("favoritesStar"));
	localStorage.removeItem("favoritesStar");

	old.sort();
	var favs = old.filter((val, idx, arr) => {
		return val !== 0;
	});
	localStorage.setItem("favs108star", JSON.stringify(favs));
}

if (localStorage.getItem("favoritesAdv")) {
	old = JSON.parse(localStorage.getItem("favoritesAdv"));
	localStorage.removeItem("favoritesAdv");

	old.sort();
	var favs = old.filter((val, idx, arr) => {
		return val !== 0;
	});
	localStorage.setItem("favs108advanced", JSON.stringify(favs));
}
/* End: Backward Compatibility */


var favStorageName = "favs" + gsatYear + gsatType; // e.g. favs108apply
if (typeof sharedKey !== "undefined")
	favStorageName = sharedKey;

initGsatFilter();

var favs = [];
if (localStorage.getItem(favStorageName))
	favs = JSON.parse(localStorage.getItem(favStorageName));

if (!(favs instanceof Array)) {
	console.error("Unknown type of favs:", favs);
	favs = [];
}

/* Loaded */
parseHash();
adjustGsatFilter();
document.getElementById("loading").style.display = "none";


/* Table Header */
window.addEventListener("scroll", function () {
	var nav = document.getElementsByTagName("nav")[0];
	var body = document.getElementsByTagName("body")[0];
	if (window.scrollY > 200) {
		nav.classList.add("fixed");
		body.style.top = "40px";
	}
	if (window.scrollY < 20) {
		nav.classList.remove("fixed");
		body.style.top = "0px";
	}

	adjustTableHeader();
});

window.addEventListener("resize", () => {
	adjustTableHeader();
});



/* Suggest List */
var currentFocus;
if (input !== null) {
	input.addEventListener("keydown", function(e) {
		var x = document.getElementById("dep-list");
		if (x)
			x = x.getElementsByTagName("div");
		if (e.keyCode == 40) { // Down
			currentFocus++;
			addActive(x);
		} else if (e.keyCode == 38) { // Up
			currentFocus--;
			addActive(x);
		} else if (e.keyCode == 13 || e.keyCode == 32) { // Enter || Space
			e.preventDefault();
			if (x && currentFocus > -1)
				x[currentFocus].click();
		}
	});
}
