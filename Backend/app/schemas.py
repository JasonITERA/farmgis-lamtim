from pydantic import BaseModel
from typing import Optional, Any

class FasilitasBase(BaseModel):
    id_fasilitas: int
    nama_fasilitas: str
    jenis_fasilitas: str
    geom: Optional[Any] = None  # Menampung string hasil konversi ST_AsText

    class Config:
        from_attributes = True