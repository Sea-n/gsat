<?php
require('tg-login.php');

/* Auth */
try {
	$auth_data_json = urldecode($_COOKIE['tg_user'] ?? '[]');
	$auth_data = json_decode($auth_data_json, true);

	$tg_user = checkTelegramAuthorization($auth_data);
} catch (Exception $e) {
	header('Location: ./');
	exit(json_encode([
		'ok' => false,
		'msg' => $e->getMessage()
	]));
}


/* Check Input */
if (!isset($_POST['type']))
	exit(json_encode([
		'ok' => false,
		'msg' => 'No Data Type.'
	]));

$type = $_POST['type'];

if (!in_array($type, [
	'108apply',
	'108star',
	'108advanced',
]))
	exit(json_encode([
		'ok' => false,
		'msg' => "Type $type not recognized."
	]));


if (!isset($_POST['favs']))
	exit(json_encode([
		'ok' => false,
		'msg' => 'No favs.'
	]));

$data = json_decode($_POST['favs']);
if ($data === null)
	exit(json_encode([
		'ok' => false,
		'msg' => 'Favs is not a valid JSON.'
	]));

$favs = [];
foreach ($data as $item) {
	if (!is_string($item) || !preg_match('#\d{5,6}#', $item))
		exit(json_encode([
			'ok' => false,
			'msg' => "Invalid fav $item."
		]));
}
sort($favs);
$favs = array_unique($favs);

$count = count($favs);
if ($count === 0)
	exit(json_encode([
		'ok' => false,
		'msg' => "No fav after clean."
	]));

$json = json_encode($favs, JSON_PRETTY_PRINT);


/* Check user directory */
$username = $tg_user['username'];
$dir = "storage/$username";

if (!file_exists($dir))
	mkdir($dir);

$hash = substr(sha1($type . $json), 0, 3);


/* Save file */
$file = "$dir/$type-$hash.json";
if (file_exists($file))
	exit(json_encode([
		'ok' => true,
		'count' => $count,
		'key' => "$username-$type-$hash",
		'msg' => 'Data exists.'
	]));

file_put_contents($file, $json);

$time = time();
file_put_contents("$dir/index.tsv", "$time\t$type\t$hash\t$count\n", FILE_APPEND);

echo json_encode([
	'ok' => true,
	'count' => $count,
	'key' => "$username-$type-$hash",
], JSON_PRETTY_PRINT);
