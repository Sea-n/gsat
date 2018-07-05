
var groups = []; // star only
var data = [];
var default_max_result = 20;
var max_result = default_max_result; // max count for result
var currentFocus;

var fliter = {
    "國文": 0,
    "英文": 0,
    "數學": 0,
    "社會": 0,
    "自然": 0
};

var input = document.getElementById("dep");

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

function startIntro(){
  var intro = introJs();
    intro.setOptions({
      steps: [
        {
          element: '#dep',
          intro: "輸入想查詢的校系",
          position: 'bottom-middle-aligned'
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