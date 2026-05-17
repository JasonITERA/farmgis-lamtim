from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geometry
from app.database import Base

class Fasilitas(Base):
    # PENTING: Ganti string di bawah ini sesuai nama tabel asli Anda di PostgreSQL 16
    __tablename__ = "nama_tabel_fasilitas_anda"  

    id_fasilitas = Column(Integer, primary_key=True, index=True)
    nama_fasilitas = Column(String, nullable=False)
    jenis_fasilitas = Column(String, nullable=False)
    
    # srid=4326 menggunakan standar koordinat bumi WGS 84 (Lng, Lat)
    geom = Column(Geometry(geometry_type='GEOMETRY', srid=4326))