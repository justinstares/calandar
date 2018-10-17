<?php
header("Content-Type: application/json");
require 'database.php';
ini_set("session.cookie_httponly", 1);

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$stmt = $mysqli->prepare("select count(*), username, password from users where username=?");

$stmt->bind_param('s', $user);

$user = $mysqli->real_escape_string($json_obj['user']);
$stmt->execute();

$stmt->bind_result($cnt, $userID, $hashed_password);
$stmt->fetch();

$pwd_guess = $mysqli->real_escape_string($json_obj['pass']);

if($cnt == 1 && password_verify($pwd_guess, $hashed_password)){
    session_start();
    $_SESSION['userID'] = $userID;
    $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));

    echo json_encode(array(
        "success" => true
    ));
    exit;
}else{
    echo json_encode(array(
        "success" => false,
        "message" => "Incorrect Username or Password"
    ));
    exit;
}
?>