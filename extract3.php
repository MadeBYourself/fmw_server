<?php
// Leer datos de configuración desde config.ini
$config = parse_ini_file('config.ini');

$servername = $config['host'];
$username = $config['username'];
$password = $config['password'];
$dbname = $config['dbname'];

// Establecer la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

$lat = floatval($_GET['lat']);
$lng = floatval($_GET['lng']);
$radius_in_meters = floatval($_GET['radius']);
$startTimestamp = (strtotime($_GET['startDateTime']) + 18000 )* 1000;
$endTimestamp = (strtotime($_GET['endDateTime']) + 18000) * 1000;

// Convierte el radio de metros a grados
$radius_in_deg = ($radius_in_meters / 400750) * 360;

// Verifica que los valores sean numéricos
if (!is_numeric($lat) || !is_numeric($lng) || !is_numeric($radius_in_deg)) {
    die("Los valores de latitud, longitud y radio deben ser numéricos.");
}

$sql = "SELECT time_stamp, latitude, longitude
FROM ubication
WHERE (6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(latitude)))) <= $radius_in_deg AND time_stamp >= $startTimestamp AND time_stamp <= $endTimestamp";
$result = $conn->query($sql);

$data = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
                // Decodificar el timestamp fecha y hora
        $row['time_stamp'] = date("Y-m-d H:i:s", ($row['time_stamp'] / 1000)-18000);
        $data[] = $row;
    }
}else{
     $data['error'] = "No se encontraron datos en el area  seleccionada.";
}

$conn->close();

// Devolver los datos en formato JSON
echo json_encode($data);
?>
