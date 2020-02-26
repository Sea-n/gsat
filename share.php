<?php
$key = $_GET['key'] ?? '';
if (!preg_match("#^[A-Za-z0-9_@.]{5,32}\-(10[89])(apply|star|advanced)\-[0-9a-f]{2,5}$#", $key)) {
	$error = '網址格式錯誤，即將導向首頁';
} else {
	[$username, $year_type, $hash] = explode("-", $key, 3);
	$file = "sync/storage/$username/$year_type-$hash.json";
	if (!file_exists($file)) {
		$error = '查無此紀錄，請確認確認連結完整性';
	} else {
		$json = file_get_contents($file);
		$data = json_decode($json, true);
		$favs = $data['favs'];
	}
	$year = substr($year_type, 0, 3);
	$type = substr($year_type, 3);
	if ($type == "apply") $typeText = "個人申請";
	if ($type == "star") $typeText = "繁星推薦";
	if ($type == "advanced") $typeText = "指考分發";
}
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
	<title>分享資料 - 學測五選四</title>
<?php include('includes/head.html'); ?>
</head>
<body>
	<nav class="ts basic fluid borderless menu horizontally scrollable">
		<div class="ts container">
			<a class="item" href=".">首頁</a>
			<a class="item hide1" href="apply">個人申請</a>
			<a class="item hide1" href="star">繁星推薦</a>
			<a class="item hide1" href="advanced">指考分發</a>
			<div class="right fitted item">
				<img class="ts mini circular image" src="<?= $data['photo_url'] ?? '' ?>">
				<b class="item"><?= $data['name'] ?? '' ?></b>
			</div>
		</div>
	</nav>
	<header class="ts fluid vertically padded heading slate">
		<div class="ts narrow container">
			<h1 class="header">分享資料</h1>
			<div class="description">讓您跨平台分享「我的最愛」，也能即時分享給老師、同學們</div>
		</div>
	</header>
	<div class="ts container" name="main">
<?php if (!empty($error)) { ?>
		<big style='color: red;'><?= $error ?></big>
		<script>
			setTimeout(() => {
				location.href = '.';
			}, 3000);
		</script>
	</div>
<?php } else { ?>
		<div id="loading">
			<h3 class="ts header">資料讀取中...</h3>
			<p>自 108 年開始，學測最多參採四科，學測五選四網站受到全台師生廣大好評迴響，到了 109 學年度繼續更新資料，旨在提供學弟妹們好用的查詢介面，來看看您心目中的科系用了何種組合，該將準備心力放在哪些考科最有利</p>
			<p>本站為您整理了個人申請、繁星推薦、指考分發的參採科目，讓您在五選四的時代快速得到簡章重點</p>
		</div>
		<center id="count" style="display: none;">
			<center style="color: red;">注意：此為「<?= $data['name'] ?>」的分享頁面，完整 2,000 校系請見 <a href="<?= $type . $year ?>"><?= $year ?> 年<?= $typeText ?></a> 連結</center>
			<h5 class="ts header">共&nbsp;<span id="count-num">0</span>&nbsp;筆紀錄</h5>
		</center>
		<table class="ts very basic table" id="list"></table>
		<div class="ts padded basic slate" id="no-data" style="display: none;"><i class="search icon"></i><span class="header">無符合條件之結果</span></div>
		<div id="show-more" style="display: none;text-align:center">
			<button class="ts secondary basic button" onclick="max_result *= 2; updateTable();">檢視更多結果</button>
		</div>
	</div>
<?php include('includes/footer.html'); ?>
	<script src="js/utils.js?v=1025"></script>
	<script>
		var sharedKey = "<?= $key ?>"; // Generated by server-side (GET param <keys>)
		var gsatType = "<?= $type ?>";
		var gsatYear = "<?= $year ?>";
		function getDetailLink(id) {
			return 'https://sean.cat/gsat/<?= $type . $year ?>';
		}
		var data = loadConfig(sharedKey);
		localStorage.setItem(sharedKey, JSON.stringify(data.favs));
	</script>
	<script src="js/common.js?v=1014"></script>
<?php } ?>
</body>
</html>
