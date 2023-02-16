<?php
$uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/gsat/', '', $uri);
if (!preg_match("#^(apply|star|advanced)(1[01][0-9])$#", $path)) {
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

echo str_replace('<table class="ts very basic table" id="list"></table>', $table, $file);
