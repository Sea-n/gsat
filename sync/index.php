<?php
require('tg-login.php');
try {
	$auth_data_json = urldecode($_COOKIE['tg_user'] ?? '[]');
	$auth_data = json_decode($auth_data_json, true);

	$tg_user = checkTelegramAuthorization($auth_data);
} catch (Exception $e) {
	unset($tg_user);
}
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>同步資料 - 學測五選四</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<link href="https://www.sean.taipei/assets/css/tocas-ui/tocas.css" rel="stylesheet">
	<link href="//cdn.rawgit.com/gnehs/Tocas-UI-Xiaoan/master/ts.xiaoan.min.css" rel="stylesheet">
	<link href="../style.css?v=1017" rel="stylesheet">
</head>
<body>
	<nav class="ts basic fluid borderless menu horizontally scrollable">
		<div class="ts container">
			<a class="item" href="/gsat">首頁</a>
			<a class="item hide1" href="../apply">個人申請</a>
			<a class="item hide1" href="../star">繁星推薦</a>
			<a class="item hide1" href="../advanced">指考分發</a>
			<div class="right fitted item">
<?php if (isset($tg_user)) { ?>
				<img class="ts mini circular image" src="<?= $tg_user['photo_url'] ?>">
				<b class="item"><?= $tg_user['first_name'] ?></b>
<?php } else { ?>
				<img class="ts mini circular image" src="https://c.disquscdn.com/uploads/users/20967/622/avatar128.jpg">
				<b class="item">Guest</b>
<?php } ?>
			</div>
		</div>
	</nav>
	<header class="ts fluid vertically padded heading slate">
		<div class="ts narrow container">
			<h1 class="header">同步資料</h1>
			<div class="description">讓您跨平台同步「我的最愛」，也能即時分享給老師、同學們</div>
		</div>
	</header>
	<div class="ts container" name="main">
<?php
if (!isset($tg_user)) {
	echo <<<EOF
	<h3>請登入以繼續</h3>
	<script async src="https://telegram.org/js/telegram-widget.js?5" data-telegram-login="Sean_Bot" data-size="medium" data-auth-url="https://sean.cat/gsat/sync/auth" data-request-access="write"></script>
	</div>
</body>
</html>
EOF;
	exit;
}

$username = $tg_user['username'];
if (empty($username)) {
	echo <<<EOF
<big style='color:red;'>您尚未設定 Telegram Username</big>
</div>
</body>
</html>
EOF;
	exit;
}

$dir = "storage/$username";
if (!file_exists($dir)) {
	echo <<<EOF
<big style='color:red;'>您尚未保存任何紀錄</big>
</div>
</body>
</html>
EOF;
	exit;
}

echo <<<EOF
<h3>您的紀錄</h3>
<table class="ts very basic table">
<tr class="ordinary-header">
<th>日期</th>
<th>類型</th>
<th>連結</th>
<th>紀錄數量</th>
</tr>
EOF;

$list = trim(file_get_contents("$dir/index.tsv"));
$list = explode("\n", $list);
$list = array_reverse($list);

foreach ($list as $item) {
	[$time, $type, $hash, $count] = explode("\t", $item, 4);

	$key = "$username-$type-$hash"; // Before change type to human text

	$time = date("Y/m/d H:i", $time);
	
	$types = [
		"108apply" => "108 年個人申請",
		"108star" => "108 年繁星推薦",
		"108advanced" => "108 年指考分發",
	];
	if (array_key_exists($type, $types))
		$type = $types[$type];

	echo <<<EOF
<tr>
<td>$time</td>
<td>$type</td>
<td><a href="diff?key=$key" target="_blank">$hash</a></td>
<td>$count</td>
</tr>
EOF;
}
echo "</table>";

echo <<<EOF
</div>
</body>
</html>
EOF;
