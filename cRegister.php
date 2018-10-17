<?php
header("Content-Type: application/json");
require 'database.php';

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$safe_username = $mysqli->real_escape_string($json_obj['user']);
$safe_password = $mysqli->real_escape_string($json_obj['pass']);
$hashed_password = password_hash($safe_password, PASSWORD_DEFAULT);

$checkUser = $mysqli->query("select username from users where username='$safe_username'");
if(!$checkUser){
    printf("Query Prep Failed: %s\n", $mysqli->error);
    exit;
}

if($checkUser->num_rows > 0){
    echo json_encode(array(
        "success" => false,
        "message" => "Username already taken"
    ));
    exit;
}
$checkUser->close();

$safe_username = addslashes(htmlentities($safe_username));

$stmt = $mysqli->prepare("insert into users (username, password) values (?, ?)");
if(!$stmt){
    printf("Query Prep Failed: %s\n", $mysqli->error);
    exit;
}
$stmt->bind_param('ss', $safe_username, $hashed_password);
$stmt->execute();
$stmt->close();

echo json_encode(array(
    "success" => true
));
exit;
?>