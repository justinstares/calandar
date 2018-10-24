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

$user_ID = $_SESSION['userID'];
$otherUser = $mysqli->real_escape_string($json_obj['otherUser']);


$checkUser = $mysqli->query("select username from users where username='$otherUser'");
if(!$checkUser){
    printf("Query Prep Failed: %s\n", $mysqli->error);
}

if($checkUser->num_rows > 0){
    echo json_encode(array(
        "success" => true,
        "message" => "Username Exists"
    ));
    exit;
}else{
    echo json_encode(array(
      "success" => false,
      "message" => "Username does not exist"
  ));
  exit;
}


?>
