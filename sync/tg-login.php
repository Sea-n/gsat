<?php
require(__DIR__ . "/config.php");

function checkTelegramAuthorization($auth_data) {
	if (!isset($auth_data['id']))
		throw new Exception('No User ID.');

	if (!isset($auth_data['username']))
		throw new Exception('No username.');

	if (!isset($auth_data['hash']))
		throw new Exception('No Telegram hash.');

	$check_hash = $auth_data['hash'];
	unset($auth_data['hash']);

	$data_check_arr = [];

	foreach ($auth_data as $key => $value)
		$data_check_arr[] = $key . '=' . $value;

	sort($data_check_arr);
	$data_check_string = implode("\n", $data_check_arr);

	$secret_key = hash('sha256', BOT_TOKEN, true);
	$hash = hash_hmac('sha256', $data_check_string, $secret_key);

	if (!hash_equals($hash, $check_hash))
		throw new Exception('Data is NOT from Telegram.');

	if ((time() - $auth_data['auth_date']) > 365*24*60*60)
		throw new Exception('Session expired.');

	$auth_data['hash'] = $check_hash;
	return $auth_data;
}

function saveTelegramUserData($auth_data) {
	$auth_data_json = json_encode($auth_data);
	setcookie('tg_user',
		$auth_data_json,
		time() + 365*24*60*60,
		'/gsat/',
		'sean.cat',
		true,
		true);
}
