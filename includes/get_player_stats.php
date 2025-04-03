<?php
require_once 'db_connect.php';

if (!isset($_POST['userID'])) {
    echo json_encode(['success' => false, 'message' => 'User ID is missing']);
    exit;
}

$userID = $_POST['userID'];
$query = "SELECT username, score, reputation FROM users WHERE user_id = $userID LIMIT 1";
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    echo json_encode(['success' => true, 'data' => $result->fetch_assoc()]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

$conn->close();
?>