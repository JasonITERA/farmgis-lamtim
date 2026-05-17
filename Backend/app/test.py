# app/test.py
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(current_dir))

try:
    from app.database import get_db_connection
    print("🕵️‍♂️ Memulai deteksi struktur asli tabel 'fasilitas'...\n")
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            query = """
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'fasilitas'
                ORDER BY ordinal_position;
            """
            cur.execute(query)
            columns = cur.fetchall()
            
            if not columns:
                print("❌ Tabel 'fasilitas' belum terbuat atau namanya salah ketik di database kamu!")
            else:
                print("📋 STRUKTUR KOLOM TABEL FASILITAS KAMU:")
                print("-" * 50)
                print(f"{'Nama Kolom':<25} | {'Tipe Data':<20}")
                print("-" * 50)
                for col in columns:
                    print(f"{col[0]:<25} | {col[1]:<20}")
                print("-" * 50)

except Exception as e:
    print(f"❌ Gagal mendeteksi tabel: {str(e)}")