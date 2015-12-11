<?php

if (empty($_GET["latitude"]) or (empty($_GET["longitude"]) or (empty($_GET["radius"]))))
{
    http_response_code(400);
    exit;
}

//escape user input
$lat = urlencode($_GET["latitude"]);
$lon = urlencode($_GET["longitude"]);
$rad = urlencode($_GET["radius"]);

//headers for proxy servers
$headers = [
	"Accept" => "*/*",
	"Connection" => "Keep-Alive",
	"User-Agent" => sprintf("curl/%s", curl_version()["version"])
];

//nyt query:
$context = stream_context_create([
		"http" => [
		"header" => implode(array_map(function($value, $key) { return sprintf("%s: %s\r\n", $key, $value);}, $headers, array_keys($headers))),
		"method" => "GET"
		]
	]);

$contents = @file_get_contents("http://api.nytimes.com/svc/events/v2/listings.json?ll={$lat},{$lon}&radius={$rad}&api-key=458060ce8f04618f086016b9c362dac0:13:6140968");
if ($contents === false)
    {
        http_response_code(503);
        exit;
    }

header("Content-type: application/json");
print($contents);
?>