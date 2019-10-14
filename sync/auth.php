<?php
require('tg-login.php');

try {
	$auth_data = checkTelegramAuthorization($_GET);
} catch (Exception $e) {
	header('Location: ./');
	exit($e->getMessage());
}

saveTelegramUserData($auth_data);
echo "Login success!";
header('Location: ./');
