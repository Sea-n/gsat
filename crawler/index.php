<?php
$uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/gsat/', '', $uri);
if (!preg_match("#^(apply|star|advanced)(108|109)$#", $path)) {
	http_response_code(404);
	exit("No static page for crawler.");
}

$file = file_get_contents("../$path.html");
if (empty($file)) {
	http_response_code(404);
	exit("File not found.");
}

$table = file_get_contents("table-$path.html");
if (empty($table)) {
	http_response_code(404);
	exit("Static table not found.");
}

$replace = '<center><big>感謝 <a target="_blank" href="https://csy.教我.tw/">資安神童 CSY 陳思羽</a> 提供精神糧食</big></center>';
$replace .= $table;

echo str_replace('<table class="ts very basic table" id="list"></table>', $replace, $file);
