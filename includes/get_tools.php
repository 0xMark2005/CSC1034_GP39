<?php
require_once 'db_connect.php';


header('Content-Type: application/json; charset=utf-8');

//Query the 'tools' table
$sql = "SELECT itemID, itemName, itemDescription, itemImgThumbnail FROM tools";
$result = $conn->query($sql);

//Build an array of tools
$tools = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tools[] = [
            'itemID'           => $row['itemID'],
            'itemName'         => $row['itemName'],
            'itemDescription'         => $row['itemDescription'],
            'itemImgThumbnail' => $row['itemImgThumbnail']
        ];
    }
}


$conn->close();

// Output the array as JSON
echo json_encode($tools);
exit;
?>
