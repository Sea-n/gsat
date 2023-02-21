var input = document.getElementById("dep");

function adjustSuggestion() {
	if (input === null) {
		console.warn("input is undefined.");
		updateTable();
		return;
	}

	var a, b;
	var search = input.value.toUpperCase();
	currentFocus = -1;

	a = document.getElementById('dep-list');
	a.innerHTML = '';

	var count = 0;
	for (var fuzz = 0; fuzz <= 1; fuzz++) { // fuzz search = {false, true}
		for (var suggestion of suggestionList) {
			if (count >= 5)
				break;

			var item = suggestion.toUpperCase();
			var pos = item.indexOf(search);
			if (pos !== -1) { // exactly match
				if (fuzz)
					continue;
			} else if (fuzz) { // try fuzz mode
				var fs = search[0];
				for (var k=1; k<search.length; k++) {
					if (CJK.test(search[k-1]) && CJK.test(search[k]))
						fs += ".*";
					fs += search[k];
				}
				if (!item.match(fs))
					continue; // fuzz search still fail
			} else
				continue; // not matched

			b = document.createElement("div");
			b.id = "sug" + count;
			if (fuzz == 0) {
				b.innerHTML = suggestion.substr(0, pos);
				b.innerHTML += "<strong>" + suggestion.substr(pos, search.length) + "</strong>";
				b.innerHTML += suggestion.substr(pos + search.length);
			} else {
				b.innerHTML = suggestion;
			}
			b.innerHTML += "<input type='hidden' value='" + suggestion + "'>";

			b.addEventListener("click", function(e) {
				input.value = this.getElementsByTagName("input")[0].value;
				adjustSuggestion();
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
	for (var item of x)
		item.classList.remove("autocomplete-active");
}

/* Initial Page */
function parseHash() {
	if (input === null) {
		console.warn("input is undefined.");
		return;
	}

	if (window.location.hash.length === 0) {
		adjustSuggestion();
		return;
	}
	var queries = decodeURIComponent(window.location.hash).substr(1).split(';');
	for (var query of queries) {
		query = query.split('=', 2);
		if (query[0] === 'q') {
			input.value = query[1];
		} else if (query[0] === 'y') {
			filterAdv[query[1]] = 1;
		} else if (query[0] === 'n') {
			filterAdv[query[1]] = -1;
		}
	}
	adjustSuggestion();
}

function initGsatFilter() {
	var fG = document.getElementById("filterGsat");
	if (fG === null) {
		console.warn("filterGsat is undefined.");
		return;
	}

	fG = fG.children;

	for (var k = 0; k < subjectsGsat.length; k++) {
		var fGm = fG[k].getElementsByClassName("menu")[0];
		for (var i = 0; i < 7; i++) {
			fGm.children[i].onclick = (e) => {
				var t = e.target;
				var d = t.dataset;
				var m = parseInt(d.mark);
				filterGsat[ d.subject ] = m;
				adjustGsatFilter();
			}
		}
	}
}

function adjustGsatFilter() {
	var fG = document.getElementById("filterGsat");
	if (fG === null) {
		console.warn("filterGsat is undefined.");
		updateTable();
		return;
	}

	fG = fG.children;

	for (var k = 0; k < subjectsGsat.length; k++) {
		var s = subjectsGsat[k];
		var fGb = fG[k];
		var fGt = fGb.getElementsByClassName("text")[0];
		fGb.classList.remove("negative", "info", "primary", "positive");
		if (filterGsat[s] == 6) {
			fGt.innerText = s;
		} else {
			fGb.classList.add(markClasses[ filterGsat[s] ]);
			fGt.innerText = s + ": " + markLables[ filterGsat[s] ];
		}
	}
	localStorage.setItem("gsatMarks", JSON.stringify(filterGsat));
	updateTable();
}

function updateTable(search) {
	if (search === undefined) {
		if (input !== null)
			search = input.value;
		else
			search = '';
	}

	var clear = document.getElementById("clear");
	if (clear !== null) {
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
	}

	var stone = document.getElementById('stone');
	if (stone !== null) {
		if (/資訊|APCS|電機/i.test(search))
			stone.style.display = '';
		else
			stone.style.display = 'none';
	}

	var href = "#q=" + search;
	if (search == "")
		href = "";

	for (var i = 0; i < subjectsAdv.length; i++) {
		var s = subjectsAdv[i];
		if (filterAdv[s] !== 0) {
			if (href === "")
				href = "#";
			else
				href += ";";
		}

		if (filterAdv[s] === 1)
			href += "y=" + s;
		else if (filterAdv[s] === -1)
			href += "n=" + s;
	}

	var newUrl = window.location.pathname + window.location.search + href;
	if (newUrl != location.href)
	    history.pushState("", document.title, newUrl);

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
			};

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
		for (var fuzz = 0; fuzz <= 1; fuzz++) { // fuzz search = {false, true}
			for (var idx = 0; idx < data.length; idx++) {
				if (!getDepartmentFilterStatus(idx, search, showFav, fuzz))
					continue;

				var tr = document.createElement('tr');
				var id = data[idx].id;
				tr.dataset.id = id;

				for (var _ = 0; _ < subjectsAdv.length + 4; _++)
					tr.appendChild(document.createElement('td'));

				tr.cells[0].classList.add("favorites");
				var button = document.createElement('button');

				button.onclick = function(e) {
					var t = e.target;
					var id = t.parentNode.parentNode.dataset.id;
					var index = favs.indexOf(id);
					t.classList.remove("not-fav", "favorited");
					if (index == -1) {
						favs.push(id);
						favs.sort();
						t.classList.add("favorited");
					} else {
						favs.splice(index, 1);
						t.classList.add("not-fav");
					}
					localStorage.setItem(favStorageName, JSON.stringify(favs)); // save
				};

				button.classList.add(showFav ? "favorited" : "not-fav"); // determined by getDepartmentFilterStatus
				tr.cells[0].appendChild(button);

				tr.cells[1].appendChild(document.createTextNode(data[idx].school));

				if (gsatType === 'star' && starResults[data[idx].school][data[idx].name].count > 0) {
					var starLink = document.createElement('a');
					starLink.text = data[idx].name;
					starLink.school = data[idx].school;
					starLink.dep = data[idx].name;
					starLink.onclick = function () {
						getStarResults(this.school, this.dep);
					};
					tr.cells[2].appendChild(starLink);
				} else {
					tr.cells[2].appendChild(document.createTextNode(data[idx].name));
				}


				var link = document.createElement('a');
				link.text = id;
				if (gsatType == 'advanced' && gsatYear >= 110) {
					link.href = 'javascript:getDetailLink("' + id + '")';
				} else {
					link.href = getDetailLink(id);
					link.target = '_blank';
				}
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
	}

	if (count == 0) {
		document.getElementById('no-data').style.display = '';

		var stone = document.getElementById('stone');
		if (stone !== null)
			stone.style.display = 'none';
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
	for (var i = 0; i < fH.childElementCount; i++)
		fH.childNodes[i].style.width = oH.childNodes[i].getBoundingClientRect().width + "px";

	var y = table.getBoundingClientRect().y;
	if (y < 40)
		fH.style.display = "initial";
	else
		fH.style.display = "none";
}

function getDepartmentFilterStatus(idx, search, isFav, fuzz) {
	search = search.toUpperCase();
	if (data[idx].name.toUpperCase().indexOf(search) !== -1) { // exactly match
		if (fuzz)
			return false;
	} else if (fuzz) { // try fuzz mode
		var ori = search;
		search = ori[0];
		for (var i=1; i<ori.length; i++) {
			if (CJK.test(ori[i-1]) && CJK.test(ori[i]))
				search += ".*";
			search += ori[i];
		}
		if (!data[idx].name.toUpperCase().match(search))
			return false; // fuzz search still fail
	} else
		return false; // not matched

	var id = data[idx].id;
	if (favs.includes(id) != isFav)
		return false;

	for (var k = 0; k < subjectsGsat.length; k++) {
		var s = subjectsGsat[k];

		switch (data[idx].gsat[k]) {
			case "頂":
				if (filterGsat[s] == 4) return false;
			case "前":
				if (filterGsat[s] == 3) return false;
			case "均":
				if (filterGsat[s] == 2) return false;
			case "後":
				if (filterGsat[s] == 1) return false;
			case "底":
				if (filterGsat[s] == 0) return false;
		}
	}

	for (var k = 0; k < subjectsAdv.length; k++) {
		var s = subjectsAdv[k];
		if (data[idx][s] == '--' || data[idx][s] == 'x0.00') {
			if (filterAdv[s] === 1)
				return false;
		} else {
			if (filterAdv[s] == -1)
				return false;
		}
	}

	return true;
}

/* Fetch Star Data */
function fetchStarResults(year) {
	fetch('data/star_results/' + year, {})
		.then((resp) => {
			return resp.text();
		})
		.then((resp) => {
			var lines = resp.split('\n');

			for (var line of lines) {
				if (line.length == 0)
					continue;

				line = line.split('\t');
				var school = line[6];
				var dep = line[7];
				var datum = {
				recruit: line[1],
					firstPercentage: line[2],
					firstEnroll: line[3],
					secondPercentage: line[4],
					secondEnroll: line[5],
				};

				if (! (school in starResults))
					starResults[school] = {};

				if (! (dep in starResults[school]))
					starResults[school][dep] = {
						count: 0
					};

				starResults[school][dep][year] = datum;
				starResults[school][dep].count++;
			}
		})
		.then(() => {
			updateTable();
		})
}

/* Star Results */
function getStarResults(school, dep) {
	var depData = starResults[school][dep];

	var title = school + ' - ' + dep;
	document.getElementById('starTitle').innerHTML = title;

	var table = document.getElementById('starResult');
	table.innerHTML = '';

	var tr = document.createElement('tr');
	for (var i = 0; i < 6; i++)
		tr.appendChild(document.createElement('th'));

	tr.cells[0].classList.add('title');
	for (var i = 1; i <= 5; i++) {
		tr.cells[i].appendChild(document.createTextNode(gsatYear - i));
		tr.cells[i].classList.add('data');
	}

	table.appendChild(tr);

	var columns = {
		recruit: '招生名額',
		firstEnroll: '一階錄取人數',
		firstPercentage: '一階錄取百分比',
		secondEnroll: '二階錄取人數',
		secondPercentage: '二階錄取百分比'
	};

	for (var i in columns) {
		var tr = document.createElement('tr');
		for (var j = 0; j < 6; j++)
			tr.appendChild(document.createElement('td'));
		tr.cells[0].appendChild(document.createTextNode(columns[i]));

		for (var k = 1; k <= 5; k++) {
			if (depData[gsatYear - k] !== undefined)
				tr.cells[k].appendChild(document.createTextNode(depData[gsatYear - k][i]));
			else
				tr.cells[k].appendChild(document.createTextNode('--'));
		}

		table.appendChild(tr);
	}

	document.getElementById('starFloat').style.display = 'block';
	document.body.style.overflow = 'hidden';
}

function getDetailLink(id) {
	if (gsatType == 'advanced') {
		if (gsatYear <= 109)
			return 'https://campus4.ncku.edu.tw/uac/cross_search/dept_info/' + id + '.html';

		// Exception: run js rather than static link
		document.getElementById('adv-dep-id').value = id;
		document.getElementById('adv-uac').submit();
		return;
	}

	const urls = [
		'https://www.cac.edu.tw/apply108/system/108ColQry_forapply_3r5k9d/html/108_ID.htm',
		'https://www.cac.edu.tw/apply109/system/109ColQrytk4p_forapply_os92k5w/html/109_ID.htm',
		'https://www.cac.edu.tw/apply110/system/110_aColQry4qy_forapply_o5wp6ju/html/110_ID.htm',
		'https://www.cac.edu.tw/apply111/system/0ColQry_for111apply_8fr51gfw/html/111_ID.htm',
		'https://www.cac.edu.tw/apply112/system/6ColQry_forh112apply_8wzk94tv/html/112_ID.htm',
		'https://www.cac.edu.tw/star108/system/108ColQry_forstar_5d3o9a/html/108_ID.htm',
		'https://www.cac.edu.tw/star109/system/109ColQry6d3k_forstar_583vd/html/109_ID.htm',
		'https://www.cac.edu.tw/star110/system/110_aColQry_forstar_5pd98yr/html/110_ID.htm',
		'https://www.cac.edu.tw/star111/system/0ColQry_for111star_5f9g8t4q/html/111_ID.htm',
		'https://www.cac.edu.tw/star112/system/8ColQry_xfor112Star_Z84eH3ep/html/112_ID.htm',
	];
	for (url of urls) {
		if (url.search(gsatType + gsatYear) != -1)
			return url.replace('ID', id);
	}
}
