<?php
require('tg-login.php');

/* Duplicated with sync/index.php */
if (isset($_COOKIE['tg_user'])) {
	try {
		$auth_data_json = urldecode($_COOKIE['tg_user']);
		$auth_data = json_decode($auth_data_json, true);

		$tg_user = checkTelegramAuthorization($auth_data);
	} catch (Exception $e) {
		exit(json_encode([
			'ok' => false,
			'redirect' => "sync/",
			'error' => $e->getMessage()
		]));
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
} else {
	exit(json_encode([
		'ok' => false,
		'redirect' => "sync/",
		'error' => 'Please login first.'
	]));
}


/* Check Input */
if (!isset($_POST['year']))
	exit(json_encode([
		'ok' => false,
		'error' => 'No Data Year.'
	]));

$year = $_POST['year'];

if (!in_array($year, [
	'108',
	'109'
]))
	exit(json_encode([
		'ok' => false,
		'error' => "Year $year not recognized."
	]));


if (!isset($_POST['type']))
	exit(json_encode([
		'ok' => false,
		'error' => 'No Data Type.'
	]));

$type = $_POST['type'];

if (!in_array($type, [
	'apply',
	'star',
	'advanced',
]))
	exit(json_encode([
		'ok' => false,
		'error' => "Type $type not recognized."
	]));


if (!isset($_POST['favs']))
	exit(json_encode([
		'ok' => false,
		'error' => 'No favs.'
	]));

$data = json_decode($_POST['favs']);
if ($data === null)
	exit(json_encode([
		'ok' => false,
		'error' => 'Favs is not a valid JSON.'
	]));

foreach ($data as $item) {
	if (!is_string($item))
		exit(json_encode([
			'ok' => false,
			'error' => "Not string fav $item."
		]));

	if (!preg_match('#\d{5,6}#', $item))
		exit(json_encode([
			'ok' => false,
			'error' => "Fav $item format invalid."
		]));
}
sort($data);
$favs = array_unique($data);

$count = count($favs);
if ($count === 0)
	exit(json_encode([
		'ok' => false,
		'error' => "您尚未將任何校系新增至我的最愛喔！"
	]));

$json = json_encode([
	'name' => $name,
	'username' => $username,
	'photo_url' => $photo,
	'year' => $year,
	'type' => $type,
	'favs' => $favs
], JSON_PRETTY_PRINT);


/* Check user directory */
$dir = "storage/$username";

if (!file_exists($dir))
	mkdir($dir);

$hash = substr(sha1($type . $json), 0, 4);


/* Save file */
$file = "$dir/$year$type-$hash.json";
$key = "$username-$year$type-$hash";
if (file_exists($file))
	exit(json_encode([
		'ok' => true,
		'count' => $count,
		'key' => $key,
		'redirect' => "share?key=$key",
		'msg' => 'Data exists.'
	]));

file_put_contents($file, $json);

$time = time();
file_put_contents("$dir/index.tsv", "$time\t$year\t$type\t$hash\t$count\n", FILE_APPEND);

echo json_encode([
	'ok' => true,
	'count' => $count,
	'key' => $key,
	'redirect' => "share?key=$key",
], JSON_PRETTY_PRINT);
