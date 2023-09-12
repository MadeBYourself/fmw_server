<?php
error_reporting(E_ALL);
// Conexión a la base de datos (debes configurar las credenciales)
$conexion = new mysqli("fmwbase.c49tf0faxvcu.us-east-2.rds.amazonaws.com", "admin", "m12345678", "fmwdb");

// Verificar la conexión
if ($conexion->connect_error) {
    die("Error de conexión a la base de datos: " . $conexion->connect_error);
}

// Consulta SQL para obtener el último registro de la tabla
//$sql = "SELECT latitude, longitude, DATE_FORMAT(time_stamp, '%Y-%m-%d %H:%i:%s') AS formatted_time_stamp FROM location ORDER BY time_stamp DESC L>$sql = "SELECT latitude, longitude, time_stamp FROM location ORDER BY time_stamp DESC LIMIT 30";
$sql = "SELECT latitude, longitude, time_stamp FROM ubication ORDER BY time_stamp DESC LIMIT 30";

$resultado = $conexion->query($sql);

if ($resultado->num_rows > 0) {
    $fila = $resultado->fetch_assoc();
  //  $timestamp = strtotime($fila["time_stamp"])
   // $fechaHora = date("Y/m/d H:i:s", $timestamp)
     // Convertir los datos en un arreglo asociativo
    $datos = array(
        "latitude" => $fila["latitude"],
        "longitude" => $fila["longitude"],
      //"time_stamp" => $time_stamp // Aquí se usa la fecha y hora decodificada
        "time_stamp" => $fila["time_stamp"]
    );
    echo json_encode($datos);
} else {
    echo "No se encontraron datos en la tabla.";
}

// Cerrar la conexión a la base de datos
$conexion->close();
?>

