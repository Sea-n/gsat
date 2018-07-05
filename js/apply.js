var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/list-apply.tsv', false);
xhr.send(null);
var lines = xhr.response.split("\n");

var data = [];
var default_max_result = 20;
var max_result = default_max_result; // max count for result

for (var i = 0;; i++) {
    var obj = {};
    var line = lines[i].split('\t');
    if (line[2] === undefined)
        break;

    obj['school'] = line[0];
    obj['dep'] = line[1];
    obj['subjects'] = line[2].split(",");

    data.push(obj);
}

var lc = {};
for (var i = 1, len = data.length; i < len; i++) {
    if (lc[data[i].dep] === undefined)
        lc[data[i].dep] = 1;
    else
        lc[data[i].dep]++;
}

var list = Object.keys(lc).sort(function(a, b) {
    return lc[a] < lc[b];
});

var fliter = {
    "國文": 0,
    "英文": 0,
    "數學": 0,
    "社會": 0,
    "自然": 0
};


var input = document.getElementById("dep");
parseHash(); // init
document.getElementById("loading").style.display = "none";
input.focus();

function updateTable(val) {
    if (val === undefined)
        val = input.value;

    var clear = document.getElementById("clear");
    var rand = document.getElementById("rand");
    if (val.length <= 2) {
        clear.style.display = "none";
        rand.style.display = "";
    } else {
        clear.style.display = "";
        rand.style.display = "none";
    }

    var subjects = Object.keys(fliter);

    var href = "#q=" + val;

    for (var i = 0; i < 5; i++) {
        var s = subjects[i];
        if (fliter[s] === 1)
            href += ";y=" + s;
        else if (fliter[s] === -1)
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
    var tr = document.createElement('tr');
    for (i = 0; i < 7; i++)
        tr.appendChild(document.createElement('th'));
    tr.cells[0].appendChild(document.createTextNode('學校'));
    tr.cells[0].style.width = "20%";
    tr.cells[1].appendChild(document.createTextNode('科系'));
    tr.cells[1].style.width = "30%";
    var haveFliter = false;
    for (var i = 0; i < 5; i++) {
        var s = subjects[i];
        var button = document.createElement('button');
        button.onclick = function(e) {
            var s = e.target.innerText;
            fliter[s]++;
            if (fliter[s] > 1) fliter[s] = -1;
            updateTable();
        }

        if (fliter[s] === 0) {
            button.className = "";
            button.classList.add("sub")
        } else {
            haveFliter = true;
            if (fliter[s] === 1) {
                button.classList.add("show", "sub")
            } else if (fliter[s] === -1) {
                button.classList.add("hidden", "sub")
            }
        }

        button.appendChild(document.createTextNode(s));
        tr.cells[i + 2].style.width = "10%";
        tr.cells[i + 2].appendChild(button);
    }


    table.appendChild(tr);

    var count = 0;
    for (i = 0; i < data.length; i++) {
        if (data[i].dep.toUpperCase().indexOf(val.toUpperCase()) !== -1) {
            var tr = document.createElement('tr');
            for (_ = 0; _ < 7; _++)
                tr.appendChild(document.createElement('td'));
            tr.cells[0].appendChild(document.createTextNode(data[i].school));
            tr.cells[1].appendChild(document.createTextNode(data[i].dep));
            var show = true;
            for (j = 0; j < subjects.length; j++) {
                var s = subjects[j];
                if (data[i].subjects.indexOf(s) !== -1) {
                    tr.cells[j + 2].appendChild(document.createTextNode("採計"));
                    tr.cells[j + 2].classList.add("positive");
                    if (fliter[s] == -1)
                        show = false;
                } else {
                    if (fliter[s] === 1) {
                        show = false;
                    }
                }
            }
            if (show) {
                count++;
                if (count > max_result)
                    continue;
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

var currentFocus;

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

function resetFliter(type = 0) {
    var recmd = [
        '社會',
        '管理',
        '科學',
        '文學',
        '醫學',
        '教育',
        '生物',
        '化學',
        '電機',
        '會計',
        '法律',
        '經濟',
        '心理',
        '光電'
    ];
    if (list.indexOf(input.value.toUpperCase()) === -1 || type == 1) {
        input.value = recmd[Math.floor(Math.random() * recmd.length)];
    }
    if (type == 2) {
        input.value = "";
    }
    var subjects = Object.keys(fliter);
    for (var i = 0; i < 5; i++) {
        var s = subjects[i];
        fliter[s] = 0;
    }
    adjust();
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
            fliter[query[1]] = 1;
        } else if (query[0] === 'n') {
            fliter[query[1]] = -1;
        }
    }
    adjust();
}