<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Allows all origins (for development)
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Allow specific methods
header("Access-Control-Allow-Headers: Content-Type"); // Allow specific headers

// Function to handle and log errors
function handle_error($error_message) {
    $response = ["error" => $error_message];
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

// Set up an exception handler to catch any uncaught exceptions
set_exception_handler(function($exception) {
    handle_error("Error: " . $exception->getMessage());
});

// Check if the required POST data is set
if (!isset($_POST['hostname']) || !isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['database']) || !isset($_POST['query'])) {
    $response = ["error" => "Missing required POST parameters"];
    echo json_encode($response);
    exit;
}

// Get POST data
$hostname = $_POST['hostname'];
$username = $_POST['username'];
$password = $_POST['password'];
$database = $_POST['database'];
$query = $_POST['query'];

// Create connection
$conn = new mysqli($hostname, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    handle_error("Connection failed: " . $conn->connect_error);
}

// Execute query
if ($result = $conn->query($query)) {
    // Check if the result is a SELECT query
    if (strpos(strtoupper($query), 'SELECT') === 0) {
        // Fetch all results into an associative array
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $response = ["success" => true, "data" => $data];
        echo json_encode($response, JSON_PRETTY_PRINT);
        $result->free();
    } else {
        // For non-SELECT queries, return the affected rows
        $response = ["success" => true, "affected_rows" => $conn->affected_rows];
        echo json_encode($response, JSON_PRETTY_PRINT);
    }
} else {
    handle_error("Query failed: " . $conn->error);
}

$conn->close();
?>