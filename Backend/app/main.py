# app/main.py
import json
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import get_db_connection

app = FastAPI(title="FarmGIS Lampung Timur API - Full CRUD Ecosystem")

# Aktifkan CORS agar Frontend React/Vite bebas akses tanpa terblokir di localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 1. VALIDASI DATA (PYDANTIC SCHEMAS)
# ==============================================================================

class PemilikCreate(BaseModel):
    nama_pemilik: str
    nik: str
    jenis_kelamin: str
    alamat: str
    no_hp: str

class TanamanCreate(BaseModel):
    jenis_tanaman: str
    masa_tanam: str

class LahanCreate(BaseModel):
    lokasi: str
    luas_m2: float
    id_pemilik: int
    id_tanaman: int
    geojson_polygon: dict

class FasilitasCreate(BaseModel):
    nama_fasilitas: str
    jenis_fasilitas: str
    geojson_point: dict

# ==============================================================================
# 2. FULL CRUD: MODUL PEMILIK
# ==============================================================================

@app.get("/api/pemilik")
def get_all_pemilik():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id_pemilik, nama_pemilik, nik, jenis_kelamin, alamat, no_hp FROM pemilik ORDER BY id_pemilik DESC;")
            rows = cur.fetchall()
            return [{"id_pemilik": r[0], "nama_pemilik": r[1], "nik": r[2], "jenis_kelamin": r[3], "alamat": r[4], "no_hp": r[5]} for r in rows]

@app.post("/api/pemilik")
def create_pemilik(data: PemilikCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                query = "INSERT INTO pemilik (nama_pemilik, nik, jenis_kelamin, alamat, no_hp) VALUES (%s, %s, %s, %s, %s) RETURNING id_pemilik;"
                cur.execute(query, (data.nama_pemilik, data.nik, data.jenis_kelamin.title(), data.alamat, data.no_hp))
                new_id = cur.fetchone()[0]
                conn.commit()
                return {"status": "success", "message": "Data Pemilik berhasil disimpan", "id": new_id}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.put("/api/pemilik/{id_pemilik}")
def update_pemilik(id_pemilik: int, data: PemilikCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                query = "UPDATE pemilik SET nama_pemilik=%s, nik=%s, jenis_kelamin=%s, alamat=%s, no_hp=%s WHERE id_pemilik=%s;"
                cur.execute(query, (data.nama_pemilik, data.nik, data.jenis_kelamin.title(), data.alamat, data.no_hp, id_pemilik))
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Data pemilik tidak ditemukan")
                conn.commit()
                return {"status": "success", "message": "Data Pemilik berhasil diperbarui"}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.delete("/api/pemilik/{id_pemilik}")
def delete_pemilik(id_pemilik: int):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM pemilik WHERE id_pemilik = %s;", (id_pemilik,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Data pemilik tidak ditemukan")
            conn.commit()
            return {"status": "success", "message": "Data Pemilik berhasil dihapus"}

# ==============================================================================
# 3. FULL CRUD: MODUL TANAMAN
# ==============================================================================

@app.get("/api/tanaman")
def get_all_tanaman():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id_tanaman, jenis_tanaman, masa_tanam FROM tanaman ORDER BY id_tanaman DESC;")
            rows = cur.fetchall()
            return [{"id_tanaman": r[0], "jenis_tanaman": r[1], "masa_tanam": r[2]} for r in rows]

@app.post("/api/tanaman")
def create_tanaman(data: TanamanCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                query = "INSERT INTO tanaman (jenis_tanaman, masa_tanam) VALUES (%s, %s) RETURNING id_tanaman;"
                cur.execute(query, (data.jenis_tanaman, data.masa_tanam))
                new_id = cur.fetchone()[0]
                conn.commit()
                return {"status": "success", "message": "Data Tanaman berhasil disimpan", "id_tanaman": new_id}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.put("/api/tanaman/{id_tanaman}")
def update_tanaman(id_tanaman: int, data: TanamanCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                query = "UPDATE tanaman SET jenis_tanaman=%s, masa_tanam=%s WHERE id_tanaman=%s;"
                cur.execute(query, (data.jenis_tanaman, data.masa_tanam, id_tanaman))
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Data tanaman tidak ditemukan")
                conn.commit()
                return {"status": "success", "message": "Data Tanaman berhasil diperbarui"}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.delete("/api/tanaman/{id_tanaman}")
def delete_tanaman(id_tanaman: int):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM tanaman WHERE id_tanaman = %s;", (id_tanaman,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Data tanaman tidak ditemukan")
            conn.commit()
            return {"status": "success", "message": "Data Tanaman berhasil dihapus"}

# ==============================================================================
# 4. FULL CRUD: MODUL LAHAN (POLYGON GEOMETRY)
# ==============================================================================

@app.post("/api/lahan")
def create_lahan(data: LahanCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                geojson_str = json.dumps(data.geojson_polygon)
                query = "INSERT INTO lahan (lokasi, luas_m2, id_pemilik, id_tanaman, geom) VALUES (%s, %s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)) RETURNING id_lahan;"
                cur.execute(query, (data.lokasi, data.luas_m2, data.id_pemilik, data.id_tanaman, geojson_str))
                new_id = cur.fetchone()[0]
                conn.commit()
                return {"status": "success", "message": "Area Lahan spasial berhasil disimpan", "id_lahan": new_id}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.get("/api/lahan/peta")
def get_lahan_for_map():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                # Menggunakan LEFT JOIN agar data lahan tidak hilang dari peta jika data pemilik/tanaman dihapus
                query = """
                    SELECT l.id_lahan, l.lokasi, l.luas_m2, 
                           COALESCE(p.nama_pemilik, 'Tanpa Pemilik') as nama_pemilik, 
                           COALESCE(t.jenis_tanaman, 'Belum Ditanam') as jenis_tanaman, 
                           COALESCE(t.masa_tanam, '-') as masa_tanam,
                           ST_AsGeoJSON(l.geom) as geometri_str, 
                           ST_AsGeoJSON(ST_Centroid(l.geom)) as titik_tengah_str
                    FROM lahan l
                    LEFT JOIN pemilik p ON l.id_pemilik = p.id_pemilik
                    LEFT JOIN tanaman t ON l.id_tanaman = t.id_tanaman;
                """
                cur.execute(query)
                rows = cur.fetchall()
                features = []
                
                for row in rows:
                    id_lahan, lokasi, luas_m2, nama_pemilik, jenis_tanaman, masa_tanam, geometri_str, titik_tengah_str = row
                    
                    # Konversi string PostGIS menjadi Python Dict asli secara stabil
                    geometri_obj = json.loads(geometri_str) if geometri_str else None
                    titik_tengah_obj = json.loads(titik_tengah_str) if titik_tengah_str else {"coordinates": [0, 0]}
                    
                    features.append({
                        "type": "Feature", 
                        "geometry": geometri_obj,
                        "properties": {
                            "id_lahan": id_lahan, 
                            "lokasi": lokasi, 
                            "luas_m2": float(luas_m2) if luas_m2 else 0.0,
                            "pemilik": nama_pemilik, 
                            "tanaman": jenis_tanaman, 
                            "masa_tanam": masa_tanam,
                            "koordinat_klik": titik_tengah_obj.get("coordinates", [0, 0])
                        }
                    })
                return {"type": "FeatureCollection", "features": features}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Gagal memuat peta lahan: {str(e)}")

@app.put("/api/lahan/{id_lahan}")
def update_lahan(id_lahan: int, data: LahanCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                geojson_str = json.dumps(data.geojson_polygon)
                query = """
                    UPDATE lahan SET lokasi=%s, luas_m2=%s, id_pemilik=%s, id_tanaman=%s, 
                                     geom=ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326) 
                    WHERE id_lahan=%s;
                """
                cur.execute(query, (data.lokasi, data.luas_m2, data.id_pemilik, data.id_tanaman, geojson_str, id_lahan))
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Data lahan tidak ditemukan")
                conn.commit()
                return {"status": "success", "message": "Geometri & Data Lahan berhasil diperbarui"}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.delete("/api/lahan/{id_lahan}")
def delete_lahan(id_lahan: int):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM lahan WHERE id_lahan = %s;", (id_lahan,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Data lahan tidak ditemukan")
            conn.commit()
            return {"status": "success", "message": "Data Lahan berhasil dihapus dari peta"}

# ==============================================================================
# 5. FULL CRUD: MODUL FASILITAS (POINT GEOMETRY)
# ==============================================================================

@app.post("/api/fasilitas")
def create_fasilitas(data: FasilitasCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                geojson_str = json.dumps(data.geojson_point)
                query = "INSERT INTO fasilitas (nama_fasilitas, jenis_fasilitas, geom) VALUES (%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)) RETURNING id_fasilitas;"
                cur.execute(query, (data.nama_fasilitas, data.jenis_fasilitas, geojson_str))
                new_id = cur.fetchone()[0]
                conn.commit()
                return {"status": "success", "message": "Lokasi Fasilitas berhasil disimpan", "id_fasilitas": new_id}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.get("/api/fasilitas/peta")
def get_fasilitas_for_map():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                query = "SELECT id_fasilitas, nama_fasilitas, jenis_fasilitas, ST_AsGeoJSON(geom) as geom_str FROM fasilitas;"
                cur.execute(query)
                rows = cur.fetchall()
                features = []
                for row in rows:
                    id_fasilitas, nama, jenis, geom_str = row
                    geometri_obj = json.loads(geom_str) if geom_str else None
                    
                    features.append({
                        "type": "Feature", 
                        "geometry": geometri_obj,
                        "properties": {"id_fasilitas": id_fasilitas, "nama_fasilitas": nama, "jenis_fasilitas": jenis}
                    })
                return {"type": "FeatureCollection", "features": features}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Gagal memuat peta fasilitas: {str(e)}")

@app.put("/api/fasilitas/{id_fasilitas}")
def update_fasilitas(id_fasilitas: int, data: FasilitasCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                geojson_str = json.dumps(data.geojson_point)
                query = "UPDATE fasilitas SET nama_fasilitas=%s, jenis_fasilitas=%s, geom=ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326) WHERE id_fasilitas=%s;"
                cur.execute(query, (data.nama_fasilitas, data.jenis_fasilitas, geojson_str, id_fasilitas))
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Data fasilitas tidak ditemukan")
                conn.commit()
                return {"status": "success", "message": "Titik lokasi Fasilitas berhasil digeser/diperbarui"}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.delete("/api/fasilitas/{id_fasilitas}")
def delete_fasilitas(id_fasilitas: int):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM fasilitas WHERE id_fasilitas = %s;", (id_fasilitas,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Data fasilitas tidak ditemukan")
            conn.commit()
            return {"status": "success", "message": "Fasilitas berhasil dihapus dari peta"}

# ==============================================================================
# 6. ENDPOINT DASHBOARD & STATISTIK AGREGAT
# ==============================================================================

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute("SELECT COUNT(*) FROM pemilik;")
                total_pemilik = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*), COALESCE(SUM(luas_m2), 0) FROM lahan;")
                total_lahan, total_luas = cur.fetchone()
                cur.execute("SELECT COUNT(*) FROM tanaman;")
                total_tanaman = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM fasilitas;")
                total_fasilitas = cur.fetchone()[0]
                return {
                    "total_pemilik": total_pemilik, "total_lahan": total_lahan,
                    "total_luas_m2": float(total_luas), "total_jenis_tanaman": total_tanaman,
                    "total_fasilitas": total_fasilitas
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Gagal memuat statistik: {str(e)}")