<?php
$uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/gsat/', '', $uri);
if ($path !== 'apply'
 && $path !== 'star'
 && $path !== 'advanced')
	exit("ERROR: $uri");

$file = file_get_contents("$path.html");
$table = file_get_contents("table-$path.html");

echo str_replace('<table class="ts very basic table" id="list"></table>', $table, $file);
