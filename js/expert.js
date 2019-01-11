/* default varibles */
var default_max_result = 20;
var max_result = default_max_result; // max count for result

/* Initialize Fliters */
var fliter = {
	"國文": [],
	"英文": [],
	"數學": [],
	"社會": [],
	"自然": []
};
var subjects = Object.keys(fliter);

Object.keys(fliter).forEach(function(k) {
	fliter[k] = {
		"頂標": 1,
		"前標": 1,
		"均標": 1,
		"後標": 1,
		"底標": 1,
	};
});


/* Parse School Name */
var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/school', false);
xhr.send(null);
var lines = xhr.response.split('\n');

var school = {};
for (var i=0; i<lines.length; i++) {
	var line = lines[i].split(' ');
	school[line[0]] = line[1];
}

/* Sort -nr */
var lc = {};
for (var i = 0, len = data.length; i < len; i++) {
	data[i].school = school[data[i].id.substr(0, 3)];

	if (lc[data[i].name] === undefined)
		lc[data[i].name] = 1;
	else
		lc[data[i].name]++;

	for (j = 0; j < subjects.length; j++) {
		var s = subjects[j];
		if (data[i][s].match(/^\d/))
			data[i][s] = "x" + data[i][s];

		if (data[i][s][0] == '*')
			data[i][s] = '採計';
	}
}

var list = Object.keys(lc).sort(function(a, b) {
	return lc[a] < lc[b];
});

/* Loaded */
var input = document.getElementById("dep");
adjust();
document.getElementById("loading").style.display = "none";


/* Suggest List */
var currentFocus;
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

/* Header */
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
});

window.onload = () => {
	/* Countdown */
	document.getElementById("countdown").innerHTML = Math.ceil((1548360000000 - new Date().getTime()) / 1000 / 60 / 60 / 24);

	/* Initialize Fliter */
	var table = document.getElementById("fliter");
	table.innerHTML = "";
	var tr = document.createElement('tr');
	for (i = 0; i < 6; i++)
		tr.appendChild(document.createElement('th'));
	tr.cells[0].appendChild(document.createTextNode('科目'));
	Object.keys(fliter["國文"]).map(function(k, i) {
		tr.cells[i + 1].appendChild(document.createTextNode(k));
	});
	table.appendChild(tr);

	Object.keys(fliter).map(function(k, i) {
		var tr = document.createElement('tr');
		tr.appendChild(document.createElement('th'));
		tr.cells[0].appendChild(document.createTextNode(k));
		for (i = 1; i < 6; i++)
			tr.appendChild(document.createElement('td'));
		Object.keys(fliter[k]).map(function(K, I) {
			button = document.createElement('button');
			button.dataset.subject = k;
			button.dataset.mark = K;
			button.classList.add("show");
			button.onclick = (e) => {
				t = e.target;
				d = t.dataset;
				t.classList.remove("show", "hidden");
				if (fliter[ d.subject ][ d.mark ] == 1) {
					fliter[ d.subject ][ d.mark ] = 0;
					t.classList.add("hidden");
				} else {
					fliter[ d.subject ][ d.mark ] = 1;
					t.classList.add("show");
				}
				adjust();
			}
			tr.cells[I + 1].appendChild(button);
		});
		table.appendChild(tr);
	});
}

/* Functions */
function adjust() {
	var a, b, i;
	var val = input.value;
	currentFocus = -1;

	a = document.getElementById('dep-list');
	a.innerHTML = '';

	var count = 0;
	for (i = 0; i < list.length; i++) {
		if (count >= 5)
			break;
		pos = list[i].toUpperCase().indexOf(val.toUpperCase());
		if (pos !== -1) {
			b = document.createElement("div");
			b.id = "sug" + count;
			b.innerHTML = list[i].substr(0, pos);
			b.innerHTML += "<strong>" + list[i].substr(pos, val.length) + "</strong>";
			b.innerHTML += list[i].substr(pos + val.length);
			b.innerHTML += "<input type='hidden' value='" + list[i] + "'>";

			b.addEventListener("click", function(e) {
				input.value = this.getElementsByTagName("input")[0].value;
				adjust();
			});

			a.appendChild(b);
			count++;
		}
	}
	updateTable();
}

function addActive(x) {
	if (!x)
		return false;

	removeActive(x);
	if (currentFocus >= x.length)
		currentFocus = 0;
	if (currentFocus < 0)
		currentFocus = (x.length - 1);

	x[currentFocus].classList.add("autocomplete-active");
	updateTable(x[currentFocus].innerText);
}

function removeActive(x) {
	for (var i = 0; i < x.length; i++)
		x[i].classList.remove("autocomplete-active");
}

function updateTable(val) {
	if (val === undefined)
		val = input.value;

	var clear = document.getElementById("clear");
	if (val.length == 0) {
		clear.classList.add("hidden1");
		setTimeout(function () {
			clear.classList.add("hidden2");
		}, 500);
	}
	else {
		clear.classList.remove("hidden2");
		setTimeout(function () {
		   clear.classList.remove("hidden1");
		}, 1);
	}

	var href = "#q=" + val;

	if (href == "#q=")
		history.pushState("", document.title, window.location.pathname);
	else
		window.location.hash = href;

	ga('send', 'pageview', {
		'page': location.pathname + location.search + location.hash
	});

	var table = document.getElementById("list");
	table.innerHTML = "";
	var tr = document.createElement('tr');
	for (i = 0; i < 8; i++)
		tr.appendChild(document.createElement('th'));
	tr.cells[0].appendChild(document.createTextNode('學校'));
	tr.cells[0].classList.add("school");
	tr.cells[1].appendChild(document.createTextNode('科系'));
	tr.cells[1].classList.add("dep");
	for (var i = 0; i < 5; i++) {
		tr.cells[i+2].appendChild(document.createTextNode(subjects[i]));
		tr.cells[i+2].classList.add("sub");
	}

	tr.cells[7].appendChild(document.createTextNode('編號'));
	tr.cells[7].classList.add("id");

	table.appendChild(tr);

	var count = 0;
	for (i = 0; i < data.length; i++) {
		if (data[i].name.toUpperCase().indexOf(val.toUpperCase()) !== -1) {
			var tr = document.createElement('tr');
			for (_ = 0; _ < 8; _++)
				tr.appendChild(document.createElement('td'));
			tr.cells[0].appendChild(document.createTextNode(data[i].school));
			tr.cells[1].appendChild(document.createTextNode(data[i].name));

			var link = document.createElement('a');
			link.text = data[i].id;
			if (data[i].id.length == 6)
				link.href = 'https://www.cac.edu.tw/apply108/system/108ColQry_forapply_3r5k9d/html/108_' + data[i].id + '.htm';
			else
				link.href = 'https://www.cac.edu.tw/star108/system/108ColQry_forstar_5d3o9a/html/108_' + data[i].id + '.htm';
			link.target = '_blank';
			link.classList.add('id');
			tr.cells[7].appendChild(link);
			tr.cells[7].classList.add("id");

			var show = true;
			for (j = 0; j < subjects.length; j++) {
				var s = subjects[j];
				if (data[i][s] != '--') {
					if (data[i][s][1] == '標') {
						if (fliter[s][ data[i][s]  ] === 0)
							show = false;

						if (data[i][s] == '頂標')
							tr.cells[j + 2].classList.add("best");
						if (data[i][s] == '前標')
							tr.cells[j + 2].classList.add("good");
						if (data[i][s] == '均標')
							tr.cells[j + 2].classList.add("average");
						if (data[i][s] == '後標')
							tr.cells[j + 2].classList.add("bad");
						if (data[i][s] == '底標')
							tr.cells[j + 2].classList.add("worst");
					}

					if (data[i][s][0] == 'x')
						tr.cells[j + 2].classList.add("multiple");
					else
						tr.cells[j + 2].classList.add("mark"); // Add mark for all cells expect of x3

					if (data[i][s] == '採計')
						tr.cells[j + 2].classList.add("weighted");


					tr.cells[j + 2].appendChild(document.createTextNode(data[i][s]));
				}
			}
			if (show) {
				count++;
				if (count <= max_result)
					table.appendChild(tr);
			}
		}
	}

	if (count == 0) {
		document.getElementById('no-data').style.display = '';
		document.getElementById('count').style.display = 'none';
	} else {
		document.getElementById('no-data').style.display = 'none';
		document.getElementById('count').style.display = '';
	}

	while (max_result > default_max_result && count < max_result / 2) {
		max_result /= 2;
	}

	if (count > max_result) {
		document.getElementById('show-more').style.display = '';
		document.getElementById('count-num').innerHTML = max_result + ' / ' + count;
	} else {
		document.getElementById('show-more').style.display = 'none';
		document.getElementById('count-num').innerHTML = count;
	}
}

function startIntro(){
	var intro = introJs();
	intro.setOptions({
		nextLabel: '下一步',
		prevLabel: '上一步',
		skipLabel: '跳過',
		doneLabel: '完成',
		hidePrev: true,
		hideNext: true,
		showStepNumbers: false,
		steps: [
			{
				element: '#dep',
				intro: "輸入想查詢的校系"
			},
			{
				element: '#自然',
				intro: "點一下科目，啟用過濾器"
			},
			{
				element: '#at-expanding-share-button',
				intro: "點這分享，會包含您選擇的校系、科目"
			}
		]
	});

	intro.start();
}
