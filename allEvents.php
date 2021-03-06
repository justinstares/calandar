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

//------------------------------------------------------------------

$user_ID = $_SESSION['userID'];

$stmt = $mysqli->prepare("select id, title, time, date from events where username=? order by date");
if(!$stmt){
    echo json_encode(array(
      "success" => false,
      "message" => "Query Prep Failed: $mysqli->error"
    ));
    exit;
}

$stmt->bind_param('s', $user_ID);
$stmt->execute();
$stmt->bind_result($eventID, $title, $time, $date);

$events = array();
while($stmt->fetch()){
  $safe_event_id = htmlentities($eventID);
	$safe_title = htmlentities($title);
    $safe_time = htmlentities($time);
    $safe_date = htmlentities($date);

	$event = array(
		"eventID" => $safe_event_id,
		"title" => $safe_title,
        "time" => $safe_time,
        "date" => $safe_date

	);
	array_push($events,$event);
}
$stmt->close();

echo json_encode(array(
  "success" => true,
  "events" => $events
));
exit;
?>
