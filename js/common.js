/* default varibles */
var default_max_result = 20;
var max_result = default_max_result; // max count for result

/* Initialize Filters */
var filterGsat = {
	"國文": [],
	"英文": [],
	"數學": [],
	"社會": [],
	"自然": []
}

var subjectsGsat = Object.keys(filterGsat);
subjectsGsat.forEach(function(k) {
	filterGsat[k] = {
		"頂": 1,
		"前": 1,
		"均": 1,
		"後": 1,
		"底": 1,
	};
});

/* Backward Compatibility before 25 Feb 2019 */
if (localStorage.getItem("favorites")) {
	old = JSON.parse(localStorage.getItem("favorites"));
	localStorage.removeItem("favorites");

	var apply = [];
	var star = [];
	for (var i = 0; i < old.length; i++) {
		if (old[i].length == 6)
			apply.push(old[i])
		if (old[i].length == 5)
			star.push(old[i])
	}
	localStorage.setItem("favoritesApply", JSON.stringify(apply));
	localStorage.setItem("favoritesStar", JSON.stringify(star));
}

var fav = [];
if (localStorage.getItem(favStorageName))
	fav = JSON.parse(localStorage.getItem(favStorageName));

/* Loaded */
var input = document.getElementById("dep");
parseHash();
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

initFilter();

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

	/* Fixed Table Header */
	var table = document.getElementById("list");
	var y = table.getBoundingClientRect().y;
	var th = table.firstChild;
	if (y < 40)
		th.style.display = "initial";
	else
		th.style.display = "none";
});

window.addEventListener("resize", () => {
	adjustTableHeader();
})

/* Functions */
function initFilter() {
	var table = document.getElementById("filter");
	table.innerHTML = "";
	var tr = document.createElement('tr');
	for (i = 0; i < 6; i++)
		tr.appendChild(document.createElement('th'));
	tr.cells[0].appendChild(document.createTextNode('科目'));
	Object.keys(filterGsat["國文"]).map(function(k, i) {
		tr.cells[i + 1].appendChild(document.createTextNode(k + "標"));
	});
	table.appendChild(tr);

	Object.keys(filterGsat).map(function(k, i) {
		var tr = document.createElement('tr');
		tr.appendChild(document.createElement('th'));
		tr.cells[0].appendChild(document.createTextNode(k));
		for (i = 1; i < 6; i++)
			tr.appendChild(document.createElement('td'));
		Object.keys(filterGsat[k]).map(function(K, I) {
			button = document.createElement('button');
			button.dataset.subject = k;
			button.dataset.mark = K;
			button.classList.add("show");
			button.onclick = (e) => {
				t = e.target;
				d = t.dataset;
				if (filterGsat[ d.subject ][ d.mark ] == 1) {
					if (t.parentNode.previousSibling.firstElementChild &&
						t.parentNode.previousSibling.firstElementChild.classList.contains("show"))
						t = t.parentNode.previousSibling.firstElementChild;
					do {
						t.classList.remove("show", "hidden");
						t.classList.add("hidden");
						d = t.dataset;
						filterGsat[ d.subject ][ d.mark ] = 0;
					} while (t = t.parentNode.previousSibling.firstElementChild);
				} else {
					t.classList.remove("show", "hidden");
					t.classList.add("show");
					d = t.dataset;
					filterGsat[ d.subject ][ d.mark ] = 1;
					while (t.parentNode.nextSibling != undefined) {
						t = t.parentNode.nextSibling.firstElementChild;
						t.classList.remove("show", "hidden");
						t.classList.add("show");
						d = t.dataset;
						filterGsat[ d.subject ][ d.mark ] = 1;
					}
				}
				adjust();
			}
			tr.cells[I + 1].appendChild(button);
		});
		table.appendChild(tr);
	});
}

function adjust() {
	var a, b, i;
	var search = input.value;
	currentFocus = -1;

	a = document.getElementById('dep-list');
	a.innerHTML = '';

	var count = 0;
	for (i = 0; i < list.length; i++) {
		if (count >= 5)
			break;
		pos = list[i].toUpperCase().indexOf(search.toUpperCase());
		if (pos !== -1) {
			b = document.createElement("div");
			b.id = "sug" + count;
			b.innerHTML = list[i].substr(0, pos);
			b.innerHTML += "<strong>" + list[i].substr(pos, search.length) + "</strong>";
			b.innerHTML += list[i].substr(pos + search.length);
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

function parseHash() {
	if (window.location.hash.length === 0) {
		adjust();
		return;
	}
	var queries = decodeURIComponent(window.location.hash).substr(1).split(';');
	for (var i = 0; i < queries.length; i++) {
		var query = queries[i].split('=', 2);
		if (query[0] === 'q') {
			input.value = query[1];
		} else if (query[0] === 'y') {
			filterAdv[query[1]] = 1;
		} else if (query[0] === 'n') {
			filterAdv[query[1]] = -1;
		}
	}
	adjust();
}

function updateTable(search) {
	if (search === undefined)
		search = input.value;

	var clear = document.getElementById("clear");
	if (search.length == 0) {
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

	if (/資訊|APCS/i.test(search))
		document.getElementById('stone').style.display = '';
	else
		document.getElementById('stone').style.display = 'none';

	var href = "#q=" + search;
	if (search == "")
		href = "";

	for (var i = 0; i < 5; i++) {
		var s = subjectsAdv[i];
		if (filterAdv[s] === 1)
			href += ";y=" + s;
		else if (filterAdv[s] === -1)
			href += ";n=" + s;
	}

	if (href == "#q=")
		history.pushState("", document.title, window.location.pathname);
	else
		window.location.hash = href;

	ga('send', 'pageview', {
		'page': location.pathname + location.search + location.hash
	});

	var table = document.getElementById("list");
	table.innerHTML = "";

	for (var k = 0; k < 2; k++) { // fixed header and ordinary header
		var tr = document.createElement('tr');
		for (var i = 0; i < subjectsAdv.length + 4; i++)
			tr.appendChild(document.createElement('th'));

		tr.cells[0].classList.add("favorites");
		tr.cells[1].appendChild(document.createTextNode('學校'));
		tr.cells[1].classList.add("school");
		tr.cells[2].appendChild(document.createTextNode('科系'));
		tr.cells[2].classList.add("dep");

		for (var i = 0; i < subjectsAdv.length; i++) {
			var s = subjectsAdv[i];
			var button = document.createElement('button');
			button.onclick = function(e) {
				var s = e.target.innerText;
				filterAdv[s]++;
				if (filterAdv[s] > 1) filterAdv[s] = -1;
				updateTable();
			}

			button.id = s;
			if (filterAdv[s] === 1) {
				button.classList.add("show");
			} else if (filterAdv[s] === -1) {
				button.classList.add("hidden");
			}

			button.appendChild(document.createTextNode(s));
			tr.cells[i + 3].appendChild(button);
			tr.cells[i + 3].classList.add("sub");
		}

		tr.cells[subjectsAdv.length + 3].appendChild(document.createTextNode('編號'));
		tr.cells[subjectsAdv.length + 3].classList.add("id");

		table.appendChild(tr);
	}

	showFilterDepartments(table, search);

	adjustTableHeader();
}

function showFilterDepartments(table, search) {
	var count = 0;

	for (var showFav = 1; showFav >= 0; showFav--) { // show favorites = {true, false}
		for (var idx = 0; idx < data.length; idx++) {
			if (!getDepartmentFilterStatus(idx, search, showFav))
				continue;

			var tr = document.createElement('tr');
			id = data[idx].id;
			tr.dataset.id = id;

			for (_ = 0; _ < subjectsAdv.length + 4; _++)
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
				localStorage.setItem(favStorageName, JSON.stringify(fav)); // save
			}
			button.classList.add(showFav ? "favorited" : "not-fav"); // determined by getDepartmentFilterStatus
			tr.cells[0].appendChild(button);

			tr.cells[1].appendChild(document.createTextNode(data[idx].school));
			tr.cells[2].appendChild(document.createTextNode(data[idx].name));

			var link = document.createElement('a');
			link.text = id;
			link.href = getDetailLink(id);
			link.target = '_blank';
			link.classList.add('id');
			tr.cells[subjectsAdv.length + 3].appendChild(link);
			tr.cells[subjectsAdv.length + 3].classList.add("id");

			for (var k = 0; k < subjectsAdv.length; k++) {
				var s = subjectsAdv[k];

				if (data[idx][s] == "--")
					continue;

				if (data[idx][s] == "x0.00")
					continue;

				if (data[idx][s][1] == '標') {
					if (filterGsat[s][ data[idx][s] ] === 0)
						show = false;

					if (data[idx][s] == '頂標')
						tr.cells[k + 3].classList.add("best");
					if (data[idx][s] == '前標')
						tr.cells[k + 3].classList.add("good");
					if (data[idx][s] == '均標')
						tr.cells[k + 3].classList.add("average");
					if (data[idx][s] == '後標')
						tr.cells[k + 3].classList.add("bad");
					if (data[idx][s] == '底標')
						tr.cells[k + 3].classList.add("worst");
				}

				if (/x\d\.\d\d/.test(data[idx][s])) {
					tr.cells[k + 3].classList.add("mark" + k);
					tr.cells[k + 3].classList.add(data[idx][s].replace('.', '-'));
				} else if (/x\d+/.test(data[idx][s]))
					tr.cells[k + 3].classList.add("multiple");
				else
					tr.cells[k + 3].classList.add("mark");

				if (data[idx][s] == '採計')
					tr.cells[k + 3].classList.add("weighted");


				tr.cells[k + 3].appendChild(document.createTextNode(data[idx][s]));
			}

			count++;
			if (count <= max_result)
				table.appendChild(tr);
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

function adjustTableHeader() {
	var table = document.getElementById("list");
	var fH = table.childNodes[0];
	fH.classList.add("fixed-header")
	var oH = table.childNodes[1];
	oH.classList.add("ordinary-header")
	for (i = 0; i < fH.childElementCount; i++)
		fH.childNodes[i].style.width = oH.childNodes[i].getBoundingClientRect().width + "px";
}

function getDepartmentFilterStatus(idx, search, isFav) {
	if (data[idx].name.toUpperCase().indexOf(search.toUpperCase()) === -1)
		return false;

	id = data[idx].id;
	if (fav.includes(id) != isFav)
		return false;

	for (var k = 0; k < subjectsAdv.length; k++) {
		var s = subjectsAdv[k];
		if (data[idx][s] == '--') {
			if (filterAdv[s] === 1)
				return false;
		} else {
			if (filterAdv[s] == -1)
				return false;

			if (data[idx][s][1] == '標') {
				if (filterGsat[s][ data[idx][s] ] === 0)
					return false;
			}
		}
	}

	return true;
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
				element: '#英文',
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
