<?php
require "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);

    // Check if username already exists
    $stmt = $conn->prepare("SELECT userID FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Username already exists."]);
    } else {
        // Hash password before storing it
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (username, passwordHash) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $passwordHash);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Error creating user."]);
        }
    }

    $stmt->close();
    $conn->close();
}
?>