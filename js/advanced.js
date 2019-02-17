/* default varibles */
var default_max_result = 20;
var max_result = default_max_result; // max count for result

/* Initialize Fliters */
var fliterGsat = {
	"國文": [],
	"英文": [],
	"數學": [],
	"社會": [],
	"自然": []
};
var fliterAdv = {
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
var subjectsGsat = Object.keys(fliterGsat);
var subjectsAdv = Object.keys(fliterAdv);

Object.keys(fliterGsat).forEach(function(k) {
	fliterGsat[k] = {
		"頂": 1,
		"前": 1,
		"均": 1,
		"後": 1,
		"底": 1,
	};
});


var fav = [];
if (localStorage.getItem("favoritesAdv"))
	fav = JSON.parse(localStorage.getItem("favoritesAdv"));


var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/data-advanced', false);
xhr.send(null);
var lines = xhr.response.split('\n');

var data = [];
var lc = {};
for (var i=0; i<lines.length; i++) {
	var line = lines[i].split('\t');
	datum = {
		id: line[0],
		gsat: line[1].split(""),
		advanced: line[2].split(" "),
		school: line[3],
		name: line[4]
	};

	if (lc[datum.name] === undefined)
		lc[datum.name] = 1;
	else
		lc[datum.name]++;

	data.push(datum);
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
	document.getElementById("countdown").innerHTML = Math.ceil((1561924800000 - new Date().getTime()) / 1000 / 60 / 60 / 24);

	/* Initialize Fliter */
	var table = document.getElementById("fliter");
	table.innerHTML = "";
	var tr = document.createElement('tr');
	for (i = 0; i < 6; i++)
		tr.appendChild(document.createElement('th'));
	tr.cells[0].appendChild(document.createTextNode('科目'));
	Object.keys(fliterGsat["國文"]).map(function(k, i) {
		tr.cells[i + 1].appendChild(document.createTextNode(k + "標"));
	});
	table.appendChild(tr);

	Object.keys(fliterGsat).map(function(k, i) {
		var tr = document.createElement('tr');
		tr.appendChild(document.createElement('th'));
		tr.cells[0].appendChild(document.createTextNode(k));
		for (i = 1; i < 6; i++)
			tr.appendChild(document.createElement('td'));
		Object.keys(fliterGsat[k]).map(function(K, I) {
			button = document.createElement('button');
			button.dataset.subject = k;
			button.dataset.mark = K;
			button.classList.add("show");
			button.onclick = (e) => {
				t = e.target;
				d = t.dataset;
				if (fliterGsat[ d.subject ][ d.mark ] == 1) {
					if (t.parentNode.previousSibling.firstElementChild &&
						t.parentNode.previousSibling.firstElementChild.classList.contains("show"))
						t = t.parentNode.previousSibling.firstElementChild;
					do {
						t.classList.remove("show", "hidden");
						t.classList.add("hidden");
						d = t.dataset;
						fliterGsat[ d.subject ][ d.mark ] = 0;
					} while (t = t.parentNode.previousSibling.firstElementChild);
				} else {
					t.classList.remove("show", "hidden");
					t.classList.add("show");
					d = t.dataset;
					fliterGsat[ d.subject ][ d.mark ] = 1;
					while (t.parentNode.nextSibling != undefined) {
						t = t.parentNode.nextSibling.firstElementChild;
						t.classList.remove("show", "hidden");
						t.classList.add("show");
						d = t.dataset;
						fliterGsat[ d.subject ][ d.mark ] = 1;
					}
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

	if (/資訊|APCS/i.test(val))
		document.getElementById('stone').style.display = '';
	else
		document.getElementById('stone').style.display = 'none';

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
	for (i = 0; i < 14; i++)
		tr.appendChild(document.createElement('th'));
	tr.cells[0].classList.add("favorites");
	tr.cells[1].appendChild(document.createTextNode('學校'));
	tr.cells[1].classList.add("school");
	tr.cells[2].appendChild(document.createTextNode('科系'));
	tr.cells[2].classList.add("dep");
	for (var i = 0; i < 10; i++) {
		var s = subjectsAdv[i];
		var button = document.createElement('button');
		button.onclick = function(e) {
			var s = e.target.innerText;
			fliterAdv[s]++;
			if (fliterAdv[s] > 1) fliterAdv[s] = -1;
			updateTable();
		}

		button.id = s;
		if (fliterAdv[s] === 1) {
			button.classList.add("show");

		} else if (fliterAdv[s] === -1) {
			button.classList.add("hidden");
		}

		button.appendChild(document.createTextNode(s));
		tr.cells[i + 3].appendChild(button);
		tr.cells[i + 3].classList.add("sub");
	}

	tr.cells[13].appendChild(document.createTextNode('編號'));
	tr.cells[13].classList.add("id");

	table.appendChild(tr);

	var count = 0;
	for (i = 0; i < data.length; i++) {
		if (data[i].name.toUpperCase().indexOf(val.toUpperCase()) !== -1) {
			var tr = document.createElement('tr');
			id = data[i].id;
			tr.dataset.id = id;

			for (_ = 0; _ < 14; _++)
				tr.appendChild(document.createElement('td'));

			tr.cells[0].classList.add("favorites");
			var button = document.createElement('button');
			button.onclick = function(e) {
				t = e.target;
				id = t.parentNode.parentNode.dataset.id;
				index = fav.indexOf(id);
				t.classList.remove("not-fav", "favorited");
				if (index == -1) {
					fav.push(id);
					t.classList.add("favorited");
				} else {
					fav[index] = 0; // remove
					t.classList.add("not-fav");
				}
				localStorage.setItem("favoritesAdv", JSON.stringify(fav)); // save
			}
			button.classList.add(fav.includes(id) ? "favorited" : "not-fav");
			tr.cells[0].appendChild(button);

			tr.cells[1].appendChild(document.createTextNode(data[i].school));
			tr.cells[2].appendChild(document.createTextNode(data[i].name));

			var link = document.createElement('a');
			link.text = id;
			link.href = 'https://campus4.ncku.edu.tw/uac/cross_search/dept_info/' + id + '.html';
			link.target = '_blank';
			link.classList.add('id');
			tr.cells[13].appendChild(link);
			tr.cells[13].classList.add("id");

			var show = true;
			for (j = 0; j < subjectsAdv.length; j++) {
				var s = subjectsAdv[j];
				if (data[i].advanced[j] != '0.00') {
					if (fliterAdv[s] === -1)
						show = false;
					tr.cells[j + 3].appendChild(document.createTextNode('x' + data[i].advanced[j]));
					tr.cells[j + 3].classList.add("mark" + j);
					tr.cells[j + 3].classList.add("x" + data[i].advanced[j].replace('.', '-'));
				} else {
					if (fliterAdv[s] === 1)
						show = false;
				}
			}
			for (j = 0; j < subjectsGsat.length; j++) {
				var s = subjectsGsat[j];
				if (fliterGsat[s][ data[i].gsat[j] ] == false)
					show = false;
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
		document.getElementById('stone').style.display = 'none';
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
				element: '#數甲',
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
