from fastapi import APIRouter
import json
import os

router = APIRouter()

DATA_FILE = "barang.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

@router.get("/kategori-barang")
def get_kategori_barang():
    try:
        data = load_data()
        kategori_set = set(item.get("kategori", "").strip() for item in data if "kategori" in item and item.get("kategori"))
        kategori_list = sorted(list(kategori_set))
        return {"kategori": kategori_list}
    except Exception as e:
        return {"error": str(e)}
