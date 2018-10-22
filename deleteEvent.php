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

$stmt = $mysqli->prepare("delete from events where username=? and id=?");
if(!$stmt){
    echo json_encode(array(
      "success" => false,
      "message" => "Query Prep Failed: $mysqli->error"
    ));
    exit;
}

$stmt->bind_param('ss', $user_ID, $post_ID);
$stmt->execute();
$stmt->close();


echo json_encode(array(
	"success" => true
));
exit;
?>
