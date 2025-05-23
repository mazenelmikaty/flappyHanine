<?php
// filepath: /Users/mazenelmikaty/flappyHanine/validate-password.php

// Set the correct password
$correctPassword = "171110";

// Get the password from the POST request
$data = json_decode(file_get_contents("php://input"), true);
$password = $data['password'] ?? '';

// Validate the password
if ($password === $correctPassword) {
    echo json_encode(["valid" => true]);
} else {
    echo json_encode(["valid" => false]);
}
?>