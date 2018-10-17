<?php
header("Content-Type: application/json");
ini_set("session.cookie_httponly", 1);
session_start();
if($_SESSION['token'] != null){
    echo json_encode(array(
        "success" => true,
        "token" => $_SESSION['token']
    ));
    exit;
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "No token, user not logged in"
    ));
    exit;
}
?>