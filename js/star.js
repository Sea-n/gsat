var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/list-star.tsv', false);
xhr.send(null);
var lines = xhr.response.split("\n");

for (var i = 0;; i++) {
    var obj = {};
    var line = lines[i].split('\t');
    if (line[2] === undefined)
        break;

    obj['school'] = line[0];
    obj['dep'] = line[1];
    obj['group'] = line[2];
    obj['subjects'] = line[3].split(",");

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


updateGroup();
parseHash();
document.getElementById("loading").style.display = "none";
startIntro();

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

        button.id = s;
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
        if (groups.indexOf(data[i].group) === -1)
            continue;
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

    for (var i = 0; i <= 8; i++)
        document.getElementById("group" + i).checked = (1 <= i && i <= 3);

    adjust();
}

function updateGroup() {
    groups = [];
    for (var i = 0; i <= 8; i++) {
        var checkbox = document.getElementById("group" + i);
        if (checkbox.checked)
            groups.push(checkbox.value);
    }
    updateTable();
}