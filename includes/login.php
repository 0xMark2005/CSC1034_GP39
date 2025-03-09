<?php
require "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);

    // Prepare statement to prevent SQL Injection
    $stmt = $conn->prepare("SELECT userID, passwordHash FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($userID, $storedHash);
        $stmt->fetch();

        if (password_verify($password, $storedHash)) {
            session_start();
            $_SESSION["userID"] = $userID;
            $_SESSION["username"] = $username;

            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid credentials."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid username or password."]);
    }

    $stmt->close();
    $conn->close();
}
?>
