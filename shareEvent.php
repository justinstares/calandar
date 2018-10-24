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
        "message" => "Validation error",
        "bug1" => $_SESSION['userID'],
        "bug2" => $json_obj['token']
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

//------------------------------------------------------------------

$post_ID = $json_obj['id'];
$user_ID = $_SESSION['userID'];
$otherUser = $mysqli->real_escape_string($json_obj['otherUser']);


$stmt = $mysqli->prepare("select title, date, time from events where username=? and id=?");
if(!$stmt){
    echo json_encode(array(
      "success1" => false,
      "message1" => "Query Prep Failed: $mysqli->error"
    ));
    exit;
}

$stmt->bind_param('ss', $user_ID, $post_ID);
$stmt->execute();
$stmt->bind_result($title, $date, $time);
//$title1 = $title;
$events = array();
while($stmt->fetch()){
  $safe_title = htmlentities($title);
	$safe_date = htmlentities($date);
	$safe_time = htmlentities($time);
	$event = array($safe_title, $safe_date, $safe_time);
  array_push($events,$event);
}

$stmt->close();
// echo json_encode(array(
//     "success1" => true,
//     "events" => $events,
//     "otherUser" => $otherUser,
//     "message1" => "Event query successful"
// ));

//---------------------------------------------------------
$stmt2 = $mysqli->prepare("insert into events (username, title, date, time) values (?, ?, ?, ?)");
if(!$stmt2){
    echo json_encode(array(
        "success" => false,
        "events1" => $events,
        "message" => "Query Prep Failed: $mysqli->error"
    ));
    exit;
}

$stmt2->bind_param('ssss', $otherUser, $events[0][0], $events[0][1], $events[0][2]);
$stmt2->execute();
$stmt2->close();

echo json_encode(array(
    "success" => true,
    "message" => "Event added to other database",
    "otherUser" => $otherUser
));
exit;
?>
