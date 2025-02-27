<?php
/**
 * db_connect.php
    *
 */

$servername = "localhost";

// temporary me details
$username   = "jdonnelly73";
$password   = "CHZHy02qM20fcLVt";

// Name of your database
$dbname     = "CSC1034_CW_39";

// Create a new MySQLi connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check if connection succeeded
if ($conn->connect_error) {
    die("Database Connection failed: " . $conn->connect_error);
}

// Optionally, you can uncomment the next line to confirm connection
echo "Successfully connected to the database.";
?>
