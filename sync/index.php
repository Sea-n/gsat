<?php
require('tg-login.php');
try {
	$auth_data_json = urldecode($_COOKIE['tg_user'] ?? '[]');
	$auth_data = json_decode($auth_data_json, true);

	$tg_user = checkTelegramAuthorization($auth_data);
} catch (Exception $e) {
	echo <<<EOF
<html>
<body>
<script async src="https://telegram.org/js/telegram-widget.js?5" data-telegram-login="Sean_Bot" data-size="medium" data-auth-url="https://sean.cat/gsat/sync/auth" data-request-access="write"></script>
<p>Error: {$e->getMessage()}</p>
</body>
</html>
EOF;
	exit();
}

echo "Hello {$tg_user['first_name']}";
