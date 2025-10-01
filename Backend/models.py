# models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Kategori(Base):
    __tablename__ = "kategori"

    id = Column(Integer, primary_key=True, index=True)
    nama_kategori = Column(String, unique=True, index=True)

    barang = relationship("Barang", back_populates="kategori")

class Barang(Base):
    __tablename__ = "barang"

    id = Column(Integer, primary_key=True, index=True)
    nama_barang = Column(String)
    deskripsi = Column(String)
    foto = Column(String)

    kategori_id = Column(Integer, ForeignKey("kategori.id"))
    kategori = relationship("Kategori", back_populates="barang")
