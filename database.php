<?php
//The values in the mysqli() call are specific to me, change the username and password to your own
$mysqli = new mysqli('localhost', 'pdirita', 'Bj74N#%k1', 'calendar');
if($mysqli->connect_errno) {
    printf("Connection Failed: %s\n", $mysqli->connect_error);
    exit;
}
?>
