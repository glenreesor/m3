<?php

$statsFile = __DIR__ . "/stats/stats.out";

$oldVersion = 'na';
$currentVersion = 'na';
$invocationCount = 'na';
$userAgent = 'na';

if (isset($_GET['oldVersion'])) {
   $oldVersion = $_GET['oldVersion'];
}

if (isset($_GET['currentVersion'])) {
   $currentVersion = $_GET['currentVersion'];
}

if (isset($_GET['invocationCount'])) {
   $invocationCount = $_GET['invocationCount'];
}

if (isset($_GET['userAgent'])) {
   $userAgent = $_GET['userAgent'];
}

$timeStamp = date(DATE_ISO8601);
$stats="$timeStamp, $oldVersion, $currentVersion, $invocationCount, $userAgent\n";
$result = file_put_contents($statsFile, $stats, FILE_APPEND);

// Simple indicator that it succeeded.
if ($result) {
   echo $stats;
}
