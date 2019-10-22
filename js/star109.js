var gsatType = "star";
var gsatYear = "109";

var filterAdv = {
	"國文": 0,
	"英文": 0,
	"數學": 0,
	"社會": 0,
	"自然": 0
};

/* Countdown */
window.onload = () => {
	document.getElementById("countdown").innerHTML = Math.ceil((1579190400000 - new Date().getTime()) / 1000 / 60 / 60 / 24);
}

function getDetailLink(id) {
	return 'https://sean.cat/gsat/';
}
