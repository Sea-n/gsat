<?php
require('tg-login.php');

/* Duplicated with sync/save.php */
if (isset($_COOKIE['tg_user'])) {
	try {
		$auth_data_json = urldecode($_COOKIE['tg_user']);
		$auth_data = json_decode($auth_data_json, true);

		$tg_user = checkTelegramAuthorization($auth_data);
	} catch (Exception $e) {
		unset($tg_user);
	}


	$username = $tg_user['username'];

	$name = $tg_user['first_name'];
	if (isset($tg_user['last_name']))
		$name .= " " . $tg_user['last_name'];

	$photo = $tg_user['photo_url'] ?? '';
} else if (isset($_COOKIE['google_token'])) {
	$token = $_COOKIE['google_token'];

	$resp = file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token));
	$userinfo = json_decode($resp, true);

	if (!isset($userinfo['email']))
		exit(json_encode([
			'ok' => false,
			'redirect' => "sync/",
			'error' => 'Google OAuth API unauthorized.'
		]));


	$username = preg_replace("#[^a-zA-Z0-9@.]#", "_", $userinfo['email']);

	$name = $userinfo['name'];

	$photo = $userinfo['picture'] ?? '';
}
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>我的分享 - 學測五選四</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<link href="https://www.sean.taipei/assets/css/tocas-ui/tocas.css" rel="stylesheet">
	<link href="//cdn.rawgit.com/gnehs/Tocas-UI-Xiaoan/master/ts.xiaoan.min.css" rel="stylesheet">
	<link href="../style.css?v=1017" rel="stylesheet">
	<meta name="google-signin-scope" content="profile email">
	<meta name="google-signin-client_id" content="956286706085-euk5bqo0ricl4ns1obve4p51q1ajjocd.apps.googleusercontent.com">
</head>
<body>
	<nav class="ts basic fluid borderless menu horizontally scrollable">
		<div class="ts container">
			<a class="item" href="/gsat">首頁</a>
			<a class="item hide1" href="../apply">個人申請</a>
			<a class="item hide1" href="../star">繁星推薦</a>
			<a class="item hide1" href="../advanced">指考分發</a>
			<div class="right fitted item">
<?php if (isset($name)) { ?>
				<img class="ts mini circular image" src="<?= $photo ?>">
				<b class="item"><?= $name ?></b>
<?php } else { ?>
				<img class="ts mini circular image" src="https://c.disquscdn.com/uploads/users/20967/622/avatar128.jpg">
				<b class="item">Guest</b>
<?php } ?>
			</div>
		</div>
	</nav>
	<header class="ts fluid vertically padded heading slate">
		<div class="ts narrow container">
			<h1 class="header">我的分享</h1>
			<div class="description">讓您跨平台分享「我的最愛」，也能即時分享給老師、同學們</div>
		</div>
	</header>
	<div class="ts container" name="main">
<?php
/* Not login */
if (!isset($name)) {
	echo <<<EOF
		<h1 class="ts center aligned header">請登入以繼續</h1>
		<div class="ts centered secondary segment" style="max-width: 300px;">
			<h4>Telegram 登入</h4>
			<script async src="https://telegram.org/js/telegram-widget.js?5" data-telegram-login="Sean_Bot" data-size="medium" data-auth-url="https://sean.cat/gsat/sync/auth" data-request-access="write"></script>

			<h4>Google 登入</h4>
			<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
		</div>
	</div>

	<script>
		function onSignIn(googleUser) {
			var profile = googleUser.getBasicProfile();
			var id_token = googleUser.getAuthResponse().id_token;
			document.cookie = "google_token=" + id_token + "; expire=Fri, 31 Dec 9999 12:00:00 GMT; domain=sean.cat; path=/gsat/";
			location.href = ".";
		}
	</script>
	<script src="https://apis.google.com/js/platform.js" async defer></script>
</body>
</html>
EOF;
	exit;
}

/* No user identity */
if (empty($username)) {
	echo <<<EOF
<h3 class="ts center aligned icon header">
<i class="caution sign icon"></i>您尚未設定 Telegram Username
</h3>
</div>
</body>
</html>
EOF;
	exit;
}

/* New User */
$dir = "storage/$username";
if (!file_exists($dir)) {
	echo <<<EOF
<h3 class="ts center aligned icon header">
<i class="file text outline icon"></i>您尚未保存任何紀錄
</h3>
</div>
</body>
</html>
EOF;
	exit;
}

/* Show Records */
echo <<<EOF
<h3>您的紀錄</h3>
<table class="ts very basic table">
<tr class="ordinary-header">
<th>日期</th>
<th>年份</th>
<th>類型</th>
<th>連結</th>
<th>紀錄數量</th>
</tr>
EOF;

$list = trim(file_get_contents("$dir/index.tsv"));
$list = explode("\n", $list);
$list = array_reverse($list);

foreach ($list as $item) {
	[$time, $year, $type, $hash, $count] = explode("\t", $item, 5);

	$key = "$username-$year$type-$hash"; // Before change type to human text

	$time = date("Y/m/d H:i", $time);

	$types = [
		"apply" => "個人申請",
		"star" => "繁星推薦",
		"advanced" => "指考分發",
	];
	if (array_key_exists($type, $types))
		$type = $types[$type];

	echo <<<EOF
<tr>
<td>$time</td>
<td>$year 學年度</td>
<td>$type</td>
<td><a href="../share?key=$key" target="_blank">$hash</a></td>
<td>$count</td>
</tr>
EOF;
}

echo <<<EOF
</table>
</div>
</body>
</html>
EOF;
