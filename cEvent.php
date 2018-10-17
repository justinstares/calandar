<?php
header("Content-Type: application/json");
require 'database.php';
ini_set("session.cookie_httponly", 1);
session_start();

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

if(empty($_SESSION['userID']) && $json_obj['token'] == null){
    session_destroy();
    echo json_encode(array(
        "success" => false,
        "message" => "Not logged in"
    ));
    exit;
} else if(!empty($_SESSION['userID']) && $json_obj['token'] == null){
    echo json_encode(array(
        "success" => false,
        "message" => "Validation error"
    ));
    exit;
}

$token = $json_obj['token'];
$otoken = $_SESSION['token'];
//check for valid CSRF token before any sql query happens
if(!hash_equals($_SESSION['token'], $token)){
    echo json_encode(array(
        "success" => false,
        "message" => "Request forgery detected: $token vs $otoken"
    ));
    exit;
}

$user = $_SESSION['userID'];
$safe_title = $mysqli->real_escape_string($json_obj['title']);
$safe_date = $mysqli->real_escape_string($json_obj['date']);
$safe_time = $mysqli->real_escape_string($json_obj['time']);

$stmt = $mysqli->prepare("insert into events (username, title, date, time) values (?, ?, ?, ?)");

if(!$stmt){
    echo json_encode(array(
        "success" => false,
        "message" => $mysqli->error
    ));
    exit;
}

$stmt->bind_param('ssss', $user, $safe_title, $safe_date, $safe_time);
$stmt->execute();
$stmt->close();

echo json_encode(array(
    "success" => true,
    "message" => "Event added to database"
));
exit;
?>