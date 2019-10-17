<?php

/* Check Input */
$key = $_POST['key'];
if (!preg_match("#^[A-Za-z0-9_]{5,32}\-[0-9]+[a-z]+\-[0-9a-f]{3,}$#", $key))
	exit(json_encode([
		'ok' => false,
		'msg' => "Key $key invalid."
	]));

[$username, $type, $hash] = explode('-', $key, 3);

/* Check type */
if (!in_array($type, [
	'108apply',
	'108star',
	'108advanced',
]))
	exit(json_encode([
		'ok' => false,
		'msg' => "Type $type not recognized."
	]));

/* Check user */
$dir = "storage/$username";

if (!file_exists($dir))
	exit(json_encode([
		'ok' => false,
		'msg' => 'No such user.'
	]));

/* Check hash */
$file = "$dir/$type-$hash.json";
if (!file_exists($file))
	exit(json_encode([
		'ok' => false,
		'msg' => 'No such key.'
	]));


/* Load File */
$json = file_get_contents($file);
$favs = json_decode($json, true);

echo json_encode([
	'ok' => true,
	'favs' => $favs
], JSON_PRETTY_PRINT);
