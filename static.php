<?php
$uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/gsat/', '', $uri);
if ($path !== 'apply'
 && $path !== 'star'
 && $path !== 'advanced')
	exit("ERROR: $uri");

$file = file_get_contents("$path.html");
$table = '<h3>感謝 <a target="_blank" href="https://csy.教我.tw/">資安神童 CSY 陳思羽</a> 提供精神糧食</h3>';
$table .= file_get_contents("table-$path.html");

echo str_replace('<table class="ts very basic table" id="list"></table>', $table, $file);
