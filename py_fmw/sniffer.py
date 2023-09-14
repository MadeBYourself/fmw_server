import socket
import threading
import mysql.connector
from configparser import ConfigParser

def get_database_config():
    config = ConfigParser()
    config.read('config.ini')
    return {
        'host': config['database']['host'],
        'user': config['database']['user'],
        'password': config['database']['password'],
        'database': config['database']['database'],
    }

def udp_server(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(('0.0.0.0', port))
    print(f"Listening {port}")

    while True:
        data, addr = s.recvfrom(65535)  # Tamaño máximo UDP
        print(f" {addr}: {data.decode('utf-8')}")

        db_config = get_database_config()

        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            data_to_insert = data.decode("utf-8")
            latitude, longitude, time_stamp = data_to_insert.split(',') # Asumiendo que los valores están separados por comas

            insert_query = "INSERT INTO ubication (latitude, longitude, time_stamp) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (latitude, longitude, time_stamp))

            connection.commit()
            print("Data in database.")

        finally:
            if 'cursor' in locals() or 'cursor' in globals():
                cursor.close()
            if 'connection' in locals() or 'connection' in globals():
                connection.close()

if __name__ == "__main__":
    port = 20000
    udp_thread = threading.Thread(target=udp_server, args=(port,))
    udp_thread.start()
    udp_thread.join()

