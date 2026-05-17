# app/database.py
import psycopg2
from contextlib import contextmanager

@contextmanager
def get_db_connection():
    # Memisahkan parameter menjadi argumen mandiri agar anti-error encoding password
    conn = psycopg2.connect(
        host="localhost",
        port="5433",
        dbname="farmgis_lamtim",
        user="postgres",
        password="Admin"  # Ganti dengan password asli pgAdmin kamu
    )
    try:
        yield conn
    finally:
        conn.close()