from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from typing import List, Optional, Union
from uuid import uuid4
from datetime import date, datetime
import os, re, json, shutil, unicodedata
from pydantic import BaseModel

app = FastAPI()

# ========================
# KONFIGURASI FILE & FOLDER
# ========================
UPLOAD_DIR = "uploads"
DATA_FILE = "barang.json"
BACKUP_FILE = "barang.json.bak"
KATEGORI_FILE = "kategori.json"
KATEGORI_BACKUP = "kategori.json.bak"
CREDENTIAL_FILE = "credential.json"
PEMINJAMAN_FILE = "peminjaman.json"

class VerifikasiUpdate(BaseModel):
    status: str
    barang_id: Optional[int] = None
    unit_kode: Optional[str] = None

class PinjamRequest(BaseModel):
    nama_peminjam: str
    barang_id: Union[int, str]
    unit: str
    tanggal_pinjam: str
    tanggal_kembali: str
    keperluan: Optional[str] = None

class PeminjamanResponse(BaseModel):
    id: str
    nama: str
    nama_barang: str
    kategori_barang: str
    barang_id: Optional[int]
    tanggal_pinjam: str
    tanggal_kembali: str
    unit: str
    jumlah: int
    keperluan: str
    status: str
    assigned_units: List[str]
    tanggal_verifikasi: Optional[str] = None

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# AUTHENTIKASI
# ========================
auth_scheme = HTTPBearer(auto_error=False)

DEFAULT_CREDS = {
    "admin": {"username": "admin", "password": "admin123", "role": "admin"},
    "user": {"username": "user", "password": "user123", "role": "user"},
}

def load_credentials():
    if not os.path.exists(CREDENTIAL_FILE):
        save_credentials(DEFAULT_CREDS)
        return DEFAULT_CREDS
    try:
        with open(CREDENTIAL_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict) or not all(isinstance(v, dict) for v in data.values()):
                save_credentials(DEFAULT_CREDS)
                return DEFAULT_CREDS
            return data
    except Exception:
        save_credentials(DEFAULT_CREDS)
        return DEFAULT_CREDS

def save_credentials(creds: dict):
    with open(CREDENTIAL_FILE, "w", encoding="utf-8") as f:
        json.dump(creds, f, indent=2, ensure_ascii=False)

def _extract_token_from_header_value(val: str) -> Optional[str]:
    if not val:
        return None
    val = val.strip()
    if val.lower().startswith("bearer "):
        return val.split(" ", 1)[1].strip()
    return val

def verify_token(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme)
):
    token = None
    if credentials and getattr(credentials, "credentials", None):
        token = credentials.credentials
    if not token:
        auth_raw = request.headers.get("authorization") or request.headers.get("Authorization")
        token = _extract_token_from_header_value(auth_raw)
    if not token:
        token = _extract_token_from_header_value(request.headers.get("x-access-token") or "")
    if not token:
        token = _extract_token_from_header_value(request.headers.get("token") or "")
    if not token:
        raise HTTPException(status_code=403, detail="Not authenticated (missing token)")

    if not token.startswith("1|"):
        raise HTTPException(status_code=403, detail="Not authenticated (invalid token prefix)")

    parts = token.split("|")
    if len(parts) < 3:
        raise HTTPException(status_code=403, detail="Invalid token format")

    role = parts[1]
    creds = load_credentials()
    if role not in [c.get("role") for c in creds.values()]:
        raise HTTPException(status_code=403, detail="Role tidak valid")

    return {"token": token, "role": role}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    creds = load_credentials()
    for c in creds.values():
        if form_data.username == c["username"] and form_data.password == c["password"]:
            token = f"1|{c['role']}|{uuid4().hex}"
            return {"access_token": token, "token_type": "bearer", "role": c["role"]}
    raise HTTPException(status_code=401, detail="Username atau password salah")

# ========================
# UTIL
# ========================
def sanitize_filename(filename: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

def slugify(value: str) -> str:
    value = unicodedata.normalize('NFKD', value)
    value = value.encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^a-zA-Z0-9\s-]', '', value).strip().upper()
    parts = re.split(r'\s+', value)
    if not parts:
        return "ITEM"
    if len(parts) == 1:
        return parts[0][:6]
    return (parts[0][:3] + (parts[1][:3] if len(parts) > 1 else ''))[:6]

def generate_stok_units(start: int, jumlah: int, nama_barang: str, kondisi_default: str = "Baik") -> List[dict]:
    prefix = slugify(nama_barang)
    return [{"kode": f"{prefix}-{i:03d}", "kondisi": kondisi_default, "status": "Tersedia"} for i in range(start, start + jumlah)]

# ========================
# KATEGORI IO
# ========================
def load_kategori() -> List[str]:
    if not os.path.exists(KATEGORI_FILE):
        migrate_categories_from_barang()
    try:
        with open(KATEGORI_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                return []
            return data
    except Exception:
        return []

def save_kategori(kats: List[str]):
    if os.path.exists(KATEGORI_FILE):
        shutil.copy2(KATEGORI_FILE, KATEGORI_BACKUP)
    with open(KATEGORI_FILE, "w", encoding="utf-8") as f:
        json.dump(kats, f, indent=2, ensure_ascii=False)


def migrate_categories_from_barang():
    cats = set()
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        k = item.get("kategori")
                        if k:
                            cats.add(k)
        except Exception:
            pass
    save_kategori(sorted(list(cats)))


def add_category_if_missing(nama: str):
    kats = load_kategori()
    # support both list-of-strings and list-of-objects
    if not any((isinstance(k, dict) and k.get("nama") == nama) or (isinstance(k, str) and k == nama) for k in kats):
        # store as object for forward compatibility
        kats.append({"nama": nama})
        kats.sort(key=lambda x: x.get("nama", "").lower() if isinstance(x, dict) else x.lower())
        save_kategori(kats)


def remove_category_if_exists(category: str):
    kats = load_kategori()
    # normalize
    normalized = [k["nama"] if isinstance(k, dict) else k for k in kats]
    if category in normalized:
        new = [ {"nama": k} for k in normalized if k != category ]
        save_kategori(new)

# ========================
# DATA IO + MIGRATION barang
# ========================
def load_data() -> List[dict]:
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return []

    migrated, new_data = False, []
    for item in data:
        stok_val = item.get("stok")
        if "tahun_perolehan" not in item:
            item["tahun_perolehan"] = 2025
            migrated = True

        # stok sudah list unit
        if isinstance(stok_val, list) and all(isinstance(u, dict) for u in stok_val):
            normalized = []
            for unit in stok_val:
                kode = unit.get("kode") or ""
                kondisi = unit.get("kondisi") or "Baik"
                status = unit.get("status") or "Tersedia"
                normalized.append({"kode": kode, "kondisi": kondisi, "status": status})
            item["stok"] = normalized
            if "kondisi_barang" in item:
                item.pop("kondisi_barang", None)
                migrated = True
            new_data.append(item)
            continue

        # stok masih int atau str digit
        if isinstance(stok_val, int) or (isinstance(stok_val, str) and stok_val.isdigit()):
            jumlah = int(stok_val)
            kondisi_default = item.get("kondisi_barang", "Baik")
            item["stok"] = generate_stok_units(1, jumlah, item.get("nama_barang", "ITEM"), kondisi_default)
            item.pop("kondisi_barang", None)
            migrated, new_data = True, new_data + [item]
            continue

        # stok kosong
        if stok_val is None:
            item["stok"] = []
            if "kondisi_barang" in item:
                item.pop("kondisi_barang", None)
                migrated = True
        new_data.append(item)

    if migrated:
        save_data(new_data)
    if not os.path.exists(KATEGORI_FILE):
        migrate_categories_from_barang()
    return new_data


def save_data(data: List[dict]):
    if os.path.exists(DATA_FILE):
        shutil.copy2(DATA_FILE, BACKUP_FILE)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ========================
# ENDPOINTS - BARANG
# ========================
@app.get("/barang")
def get_all_barang():
    return load_data()

@app.get("/barang/{id}")
def get_barang(id: int):
    data = load_data()
    for item in data:
        if item.get("id") == id:
            return item
    raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

@app.post("/barang")
async def create_barang(
    nama_barang: str = Form(...),
    kategori: str = Form(...),
    stok: int = Form(...),
    kondisi_barang: str = Form(...),
    deskripsi: str = Form(""),
    tahun_perolehan: int = Form(2025),
    foto: UploadFile = File(None)
):
    data = load_data()
    new_id = max([item.get("id", 0) for item in data], default=0) + 1
    foto_filename = None
    if foto:
        foto_filename = sanitize_filename(foto.filename)
        file_path = os.path.join(UPLOAD_DIR, foto_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)

    stok_list = generate_stok_units(1, stok, nama_barang, kondisi_default=kondisi_barang)
    new_barang = {
        "id": new_id,
        "nama_barang": nama_barang,
        "kategori": kategori,
        "tahun_perolehan": tahun_perolehan,
        "stok": stok_list,
        "deskripsi": deskripsi,
        "foto": foto_filename
    }
    data.append(new_barang)
    save_data(data)
    add_category_if_missing(kategori)
    return {"message": "Barang berhasil ditambahkan", "barang": new_barang}

@app.put("/barang/{barang_id}")
async def update_barang(
    barang_id: int,
    nama_barang: str = Form(...),
    kategori: str = Form(...),
    deskripsi: str = Form(""),
    tahun_perolehan: int = Form(2025),
    stok_tambah: int = Form(0),
    kondisi_barang: str = Form("Baik"),
    foto: UploadFile = File(None),
    hapus_foto: bool = Form(False)
):
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    barang["nama_barang"] = nama_barang
    barang["kategori"] = kategori
    barang["deskripsi"] = deskripsi
    barang["tahun_perolehan"] = tahun_perolehan

    # tambah stok baru (append)
    if stok_tambah and stok_tambah > 0:
        existing_units = barang.get("stok", [])
        last_number = 0
        if existing_units:
            try:
                last_number = int(existing_units[-1]["kode"].split("-")[-1])
            except Exception:
                last_number = len(existing_units)
        new_units = generate_stok_units(last_number + 1, stok_tambah, nama_barang, kondisi_barang)
        barang["stok"].extend(new_units)

    # hapus foto lama jika diminta
    if hapus_foto and barang.get("foto"):
        path = os.path.join(UPLOAD_DIR, barang["foto"])
        if os.path.exists(path):
            os.remove(path)
        barang["foto"] = None

    # upload foto baru
    if foto:
        foto_filename = sanitize_filename(foto.filename)
        file_path = os.path.join(UPLOAD_DIR, foto_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)
        barang["foto"] = foto_filename

    save_data(data)
    add_category_if_missing(kategori)
    return {"message": "Barang berhasil diperbarui", "barang": barang}

@app.delete("/barang/{id}")
def delete_barang(id: int, token: str = Depends(verify_token)):
    data = load_data()
    for i, item in enumerate(data):
        if item.get("id") == id:
            if item.get("foto"):
                foto_path = os.path.join(UPLOAD_DIR, item["foto"])
                if os.path.exists(foto_path):
                    os.remove(foto_path)
            deleted = data.pop(i)
            save_data(data)
            return {"message": "Barang berhasil dihapus", "data": deleted}
    raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

@app.post("/barang/{id}/upload-foto")
def upload_foto(id: int, file: UploadFile = File(...), token: str = Depends(verify_token)):
    data = load_data()
    for item in data:
        if item.get("id") == id:
            ext = os.path.splitext(file.filename)[-1]
            filename = f"barang_{id}{ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, "wb") as buffer:
                buffer.write(file.file.read())
            item["foto"] = filename
            save_data(data)
            return {"message": "Foto berhasil diupload", "filename": filename}
    raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

@app.get("/barang/{barang_id}/stok")
def get_barang_stok(barang_id: int):
    """Ambil semua unit stok yang status == 'Tersedia'"""
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    tersedia_units = [unit for unit in barang.get("stok", []) if unit.get("status") == "Tersedia"]
    return {"barang_id": barang_id, "units": tersedia_units}

# ========================
# ENDPOINTS - STOK UNIT
# ========================
@app.put("/barang/{barang_id}/stok/{unit_kode}")
def update_unit_stok(
    barang_id: int,
    unit_kode: str,
    kondisi: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    token: str = Depends(verify_token)
):
    """
    Update kondisi atau status unit stok barang.
    - barang_id: ID barang
    - unit_kode: Kode unit
    - kondisi: kondisi baru (opsional)
    - status: status baru (opsional)
    """
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    found = False
    for unit in barang.get("stok", []):
        if unit.get("kode", "").lower() == unit_kode.lower():
            if kondisi:
                unit["kondisi"] = kondisi
            if status:
                unit["status"] = status
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Unit stok tidak ditemukan")

    save_data(data)

    return {
        "message": "Unit stok diperbarui",
        "barang_id": barang_id,
        "unit_kode": unit_kode,
        "kondisi": kondisi,
        "status": status
    }

@app.get("/barang/{barang_id}/stok/{unit_kode}")
def get_unit_stok(barang_id: int, unit_kode: str):
    """Ambil detail unit stok tertentu"""
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    for unit in barang.get("stok", []):
        if unit.get("kode", "").lower() == unit_kode.lower():
            return unit

    raise HTTPException(status_code=404, detail="Unit stok tidak ditemukan")

@app.delete("/barang/{barang_id}/stok/{unit_kode}")
def delete_unit_stok(barang_id: int, unit_kode: str, token: str = Depends(verify_token)):
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    stok_units = barang.get("stok", [])
    unit_index = next((i for i, u in enumerate(stok_units) if u.get("kode", "").lower() == unit_kode.lower()), None)

    if unit_index is None:
        raise HTTPException(status_code=404, detail="Unit stok tidak ditemukan")

    stok_units.pop(unit_index)

    if stok_units:
        prefix = unit_kode.rsplit("-", 1)[0]
        for i, unit in enumerate(stok_units, start=1):
            unit["kode"] = f"{prefix}-{i:03d}"

    save_data(data)
    return {"message": "Unit stok berhasil dihapus dan kode diperbarui", "barang_id": barang_id}

@app.post("/barang/{barang_id}/stok/bulk-delete")
def bulk_delete_stok(barang_id: int, unit_kodes: List[str], token: str = Depends(verify_token)):
    """Hapus banyak unit stok sekaligus dan re-order kode"""
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    stok_units = barang.get("stok", [])
    before_count = len(stok_units)

    stok_units = [u for u in stok_units if u.get("kode") not in unit_kodes]
    if len(stok_units) == before_count:
        raise HTTPException(status_code=404, detail="Tidak ada unit stok yang dihapus")

    # re-order ulang kode
    if stok_units:
        prefix = slugify(barang.get("nama_barang", "ITEM"))
        for i, unit in enumerate(stok_units, start=1):
            unit["kode"] = f"{prefix}-{i:03d}"

    barang["stok"] = stok_units
    save_data(data)

    return {
        "message": f"{before_count - len(stok_units)} unit stok berhasil dihapus",
        "barang_id": barang_id,
        "sisa_stok": len(stok_units)
    }

# ========================
# ENDPOINTS - KATEGORI
# ========================
@app.get("/kategori")
def get_kategori():
    kats = load_kategori()
    return [k["nama"] if isinstance(k, dict) else k for k in kats]

@app.post("/kategori")
async def create_kategori_dan_barang(
    nama_kategori: str = Form(...),
    nama_barang: str = Form(...),
    stok: int = Form(...),
    kondisi_barang: str = Form(...),
    tahun_perolehan: int = Form(2025),
    deskripsi: str = Form(""),
    foto: UploadFile = File(None),
    token: Optional[str] = Depends(lambda: None)
):
    nama_kategori = nama_kategori.strip()
    if not nama_kategori:
        raise HTTPException(status_code=400, detail="Nama kategori kosong")
    kats = load_kategori()
    if not any((isinstance(k, dict) and k.get("nama") == nama_kategori) or (isinstance(k, str) and k == nama_kategori) for k in kats):
        kats.append({"nama": nama_kategori})
        kats.sort(key=lambda x: x.get("nama", "").lower() if isinstance(x, dict) else x.lower())
        save_kategori(kats)

    data = load_data()
    new_id = max([item.get("id", 0) for item in data], default=0) + 1
    foto_filename = None
    if foto:
        foto_filename = sanitize_filename(foto.filename)
        file_path = os.path.join(UPLOAD_DIR, foto_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)

    stok_list = generate_stok_units(1, stok, nama_barang, kondisi_default=kondisi_barang)

    new_barang = {
        "id": new_id,
        "nama_barang": nama_barang,
        "kategori": nama_kategori,
        "tahun_perolehan": tahun_perolehan,
        "stok": stok_list,
        "deskripsi": deskripsi,
        "foto": foto_filename
    }
    data.append(new_barang)
    save_data(data)

    return {
        "message": "Kategori & barang pertama berhasil ditambahkan",
        "kategori": nama_kategori,
        "barang": new_barang
    }

@app.delete("/kategori/{nama}")
def delete_kategori(nama: str, token: str = Depends(verify_token)):
    nama = nama.strip()

    data = load_data()
    if any(item.get("kategori") == nama for item in data):
        raise HTTPException(status_code=400, detail="Kategori masih dipakai oleh barang")

    kats = load_kategori()
    normalized = [k["nama"] if isinstance(k, dict) else k for k in kats]

    if nama not in normalized:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")

    kats = [{"nama": k} for k in normalized if k != nama]
    save_kategori(kats)

    return {"message": "Kategori berhasil dihapus", "kategori": nama}

# ========================
# ENDPOINTS - PEMINJAMAN
# ========================
def load_peminjaman() -> List[dict]:
    if not os.path.exists(PEMINJAMAN_FILE):
        return []
    try:
        with open(PEMINJAMAN_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_peminjaman(data: List[dict]):
    with open(PEMINJAMAN_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@app.post("/pinjam", response_model=PeminjamanResponse)
async def pinjam_barang(request: Request, token: dict = Depends(verify_token)):
    # hanya user boleh meminjam
    if token["role"] != "user":
        raise HTTPException(status_code=403, detail="Hanya role user yang bisa meminjam")

    # ambil body: dukung application/json & form-data
    ct = (request.headers.get("content-type") or "").lower()
    if "application/json" in ct:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="JSON invalid")
    else:
        form = await request.form()
        body = dict(form)

    # normalization: dukung nama/nama_peminjam, unit_kode/unit
    nama = body.get("nama") or body.get("nama_peminjam") or body.get("name")
    unit_code = body.get("unit_kode") or body.get("unit")
    barang_id_raw = body.get("barang_id") or body.get("barangId") or body.get("id")

    # validasi wajib
    if not nama:
        raise HTTPException(status_code=400, detail="Field 'nama' (atau 'nama_peminjam') required")
    if not unit_code:
        raise HTTPException(status_code=400, detail="Field 'unit_kode' (atau 'unit') required")
    if barang_id_raw is None:
        raise HTTPException(status_code=400, detail="Field 'barang_id' required")

    # barang_id bisa dikirim sebagai string atau int -> parse ke int
    try:
        barang_id = int(barang_id_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Field 'barang_id' harus berupa angka")

    # parse tanggal
    tanggal_pinjam_raw = body.get("tanggal_pinjam")
    tanggal_kembali_raw = body.get("tanggal_kembali")
    if not tanggal_pinjam_raw or not tanggal_kembali_raw:
        raise HTTPException(status_code=400, detail="Tanggal pinjam & tanggal kembali wajib diisi")

    try:
        tanggal_pinjam = date.fromisoformat(tanggal_pinjam_raw)
        tanggal_kembali = date.fromisoformat(tanggal_kembali_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Format tanggal harus YYYY-MM-DD")

    if tanggal_kembali <= tanggal_pinjam:
        raise HTTPException(status_code=400, detail="Tanggal kembali harus setelah tanggal pinjam")

    # validasi barang & unit
    barang_data = load_data()
    barang = next((b for b in barang_data if b.get("id") == barang_id), None)
    if not barang:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    unit = next((u for u in barang.get("stok", []) if u.get("kode") == unit_code), None)
    if not unit:
        raise HTTPException(status_code=400, detail="Unit stok tidak ditemukan")

    if unit.get("status") != "Tersedia":
        raise HTTPException(status_code=400, detail="Unit stok tidak tersedia untuk dipinjam")

    if unit.get("kondisi") == "Rusak Berat":
        raise HTTPException(status_code=400, detail="Unit dengan kondisi 'Rusak Berat' tidak bisa dipinjam")

    # update status unit -> Menunggu
    unit["status"] = "Menunggu"
    save_data(barang_data)

    # ambil field keperluan bila ada
    keperluan = body.get("keperluan") or ""

    # bentuk object peminjaman (tetap simpan field "unit" agar kompatibel)
    peminjaman_data = load_peminjaman()
    new_item = {
        "id": str(uuid4()),
        "nama": nama,
        "nama_barang": barang.get("nama_barang") or body.get("nama_barang") or "",
        "kategori_barang": barang.get("kategori") or body.get("kategori_barang") or "",
        "barang_id": barang_id,
        "tanggal_pinjam": tanggal_pinjam_raw,
        "tanggal_kembali": tanggal_kembali_raw,
        "unit": unit_code,        # simpan di key 'unit' untuk backwards compatibility
        "jumlah": int(body.get("jumlah") or 1),
        "keperluan": keperluan,
        "status": "Menunggu",
        "assigned_units": [unit_code],
        "tanggal_verifikasi": None
    }

    peminjaman_data.append(new_item)
    save_peminjaman(peminjaman_data)

    return new_item

@app.get("/peminjaman/user")
async def get_peminjaman_user(token: dict = Depends(verify_token)):
    if token["role"] != "user":
        raise HTTPException(status_code=403, detail="Hanya role user yang bisa melihat data peminjaman")

    all_peminjaman = load_peminjaman()

    # Ambil status aktif (apapun variasinya)
    allowed_status = ["Disetujui", "Dipinjam", "Sedang Dipinjam"]

    user_peminjaman = [
        p for p in all_peminjaman
        if p.get("nama") == token["username"] and p.get("status") in allowed_status
    ]

    return user_peminjaman

@app.get("/verifikasi")
def get_verifikasi(token: dict = Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa mengakses verifikasi")

    peminjaman_data = load_peminjaman()
    
    # DEBUG: Print semua data untuk troubleshooting
    print("=== DEBUG DATA VERIFIKASI ===")
    for item in peminjaman_data:
        print(f"ID: {item.get('id')}, Status: {item.get('status')}, Dikembalikan: {item.get('dikembalikan')}")

    # Inject data pengembalian + flag dikembalikan
    for item in peminjaman_data:
        pengembalian_path = f"data/pengembalian/{item['id']}.json"
        
        # PERBAIKAN: Check jika folder dan file ada
        if os.path.exists(pengembalian_path):
            try:
                with open(pengembalian_path, "r") as f:
                    item["pengembalian"] = json.load(f)
                item["dikembalikan"] = True
                print(f"✅ Found pengembalian for {item['id']}")
            except Exception as e:
                print(f"❌ Error reading pengembalian file for {item['id']}: {e}")
                item["dikembalikan"] = False
        else:
            # Pastikan field dikembalikan ada
            if "dikembalikan" not in item:
                item["dikembalikan"] = False
            print(f"⚠️ No pengembalian file for {item['id']}")

    return peminjaman_data


@app.put("/verifikasi/{id}")
def update_status_verifikasi(
    id: str, 
    update_data: VerifikasiUpdate,
    token: dict = Depends(verify_token)
):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa mengubah status")

    peminjaman_data = load_peminjaman()
    item = next((item for item in peminjaman_data if item.get("id") == id), None)
    
    if not item:
        raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

    # Debug logging
    print(f"=== VERIFIKASI UPDATE ===")
    print(f"Peminjaman ID: {id}")
    print(f"Status baru: {update_data.status}")
    print(f"Barang ID dari request: {update_data.barang_id}")
    print(f"Unit kode dari request: {update_data.unit_kode}")
    print(f"Data peminjaman: {json.dumps(item, indent=2)}")

    # Update tanggal verifikasi
    item["tanggal_verifikasi"] = date.today().isoformat()
    old_status = item.get("status")
    item["status"] = update_data.status

    # Ambil barang_id dan unit_kode
    barang_id = update_data.barang_id or item.get("barang_id")
    unit_kode = update_data.unit_kode or item.get("unit")

    if barang_id and unit_kode:
        barang_data = load_data()
        barang = next((b for b in barang_data if b.get("id") == barang_id), None)
        
        if barang:
            unit = next((u for u in barang.get("stok", []) if u.get("kode") == unit_kode), None)
            if unit:
                if update_data.status == "Disetujui":
                    unit["status"] = "Dipinjam"
                    item["assigned_units"] = [unit_kode]
                    item["dikembalikan"] = False
                elif update_data.status == "Ditolak":
                    if old_status == "Menunggu":
                        unit["status"] = "Tersedia"
                    item["dikembalikan"] = False
                elif update_data.status == "Selesai":
                    unit["status"] = "Tersedia"
                    item["assigned_units"] = []
                    item["dikembalikan"] = True  # tetap True kalau sudah dikembalikan
                save_data(barang_data)
            else:
                waiting_unit = next((u for u in barang.get("stok", []) if u.get("status") == "Menunggu"), None)
                if waiting_unit:
                    unit_kode = waiting_unit.get("kode")
                    if update_data.status == "Disetujui":
                        waiting_unit["status"] = "Dipinjam"
                        item["assigned_units"] = [unit_kode]
                        item["dikembalikan"] = False
                        save_data(barang_data)

    # Simpan perubahan ke peminjaman.json
    save_peminjaman(peminjaman_data)

    # Inject data pengembalian kalau ada
    pengembalian_path = f"data/pengembalian/{id}.json"
    if os.path.exists(pengembalian_path):
        with open(pengembalian_path, "r") as f:
            item["pengembalian"] = json.load(f)
        item["dikembalikan"] = True
        print(f"✅ Data pengembalian ditemukan & ditambahkan ke response")

    return {"message": f"Status peminjaman {id} berhasil diperbarui", "data": item}

@app.put("/peminjaman/{peminjaman_id}/kembalikan")
async def kembalikan_barang(
    peminjaman_id: str,
    tanggal_kembali: str = Form(...),
    kondisi: str = Form(...),
    catatan: str = Form(""),
    foto: UploadFile = File(None),
    token: dict = Depends(verify_token)
):
    if token["role"] != "user":
        raise HTTPException(status_code=403, detail="Hanya user yang bisa mengembalikan barang")

    peminjaman_data = load_peminjaman()
    peminjaman = next((p for p in peminjaman_data if p["id"] == peminjaman_id), None)

    if not peminjaman:
        raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

    # Validasi status
    if peminjaman.get("status") not in ["Disetujui", "Dipinjam"]:
        raise HTTPException(status_code=400, detail="Hanya peminjaman yang Disetujui/Dipinjam bisa dikembalikan")

    # Simpan foto bila ada
    foto_path = None
    if foto:
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        foto_path = os.path.join(upload_dir, f"{uuid4()}_{foto.filename}")
        with open(foto_path, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)

    # Data pengembalian
    pengembalian_data = {
        "tanggal_pengembalian": tanggal_kembali,
        "kondisi_barang": kondisi,
        "catatan": catatan,
        "foto": foto_path,
    }

    # PERBAIKAN: Buat folder data/pengembalian jika belum ada
    pengembalian_dir = "data/pengembalian"
    os.makedirs(pengembalian_dir, exist_ok=True)  # ← INI YANG PERLU DITAMBAHKAN
    
    pengembalian_path = f"{pengembalian_dir}/{peminjaman_id}.json"
    
    try:
        with open(pengembalian_path, "w") as f:
            json.dump(pengembalian_data, f, indent=2)
    except Exception as e:
        print(f"Error saving pengembalian file: {e}")
        raise HTTPException(status_code=500, detail="Gagal menyimpan data pengembalian")

    # Update status peminjaman
    peminjaman["status"] = "Menunggu Verifikasi Pengembalian"  # ← PASTIKAN SPELLING BENAR
    peminjaman["tanggal_kembali"] = tanggal_kembali
    peminjaman["dikembalikan"] = True
    peminjaman["pengembalian"] = pengembalian_data

    save_peminjaman(peminjaman_data)

    print(f"✅ Pengembalian berhasil: {peminjaman_id} -> Menunggu Verifikasi Pengembalian")

    return {
        "message": "Pengembalian berhasil dicatat, menunggu verifikasi admin",
        "data": peminjaman
    }

@app.delete("/peminjaman/{id}")
def delete_peminjaman(id: str, token: dict = Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa menghapus data")

    data = load_peminjaman()
    new_data = [item for item in data if item["id"] != id]

    if len(new_data) == len(data):
        raise HTTPException(status_code=404, detail="Data peminjaman tidak ditemukan")

    save_peminjaman(new_data)
    return {"message": f"Data peminjaman {id} berhasil dihapus"}

@app.get("/riwayat")
def get_riwayat_user(token: dict = Depends(verify_token)):
    if token["role"] != "user":
        raise HTTPException(status_code=403, detail="Hanya user yang bisa melihat riwayat")
    peminjaman_data = load_peminjaman()
    # Untuk sementara, return semua (nanti bisa difilter user login)
    return peminjaman_data

@app.get("/debug/barang/{barang_id}")
def debug_barang(barang_id: int):
    """Endpoint untuk debugging status unit barang"""
    data = load_data()
    barang = next((item for item in data if item.get("id") == barang_id), None)
    if not barang:
        return {"error": "Barang tidak ditemukan"}
    
    return {
        "barang_id": barang_id,
        "nama_barang": barang.get("nama_barang"),
        "stok_units": barang.get("stok", [])
    }

@app.get("/peminjaman/user/aktif")
def get_user_peminjaman_aktif(token: dict = Depends(verify_token)):
    """
    Mengambil semua peminjaman user yang sedang dipinjam
    (status Dipinjam / Sedang Dipinjam) beserta unit yang dipinjam.
    """
    if token["role"] != "user":
        raise HTTPException(status_code=403, detail="Hanya role user yang bisa melihat data peminjaman")

    all_peminjaman = load_peminjaman()
    allowed_status = ["Dipinjam", "Sedang Dipinjam"]

    user_peminjaman = [
        {
            "id": p.get("id"),
            "barang_id": p.get("barang_id"),
            "nama_barang": p.get("nama_barang"),
            "unit": p.get("unit"),
            "tanggal_pinjam": p.get("tanggal_pinjam"),
            "tanggal_kembali": p.get("tanggal_kembali"),
            "status": p.get("status")
        }
        for p in all_peminjaman
        if p.get("nama") == token["username"] and p.get("status") in allowed_status
    ]

    return user_peminjaman

@app.put("/peminjaman/{peminjaman_id}/kembalikan")
async def kembalikan_barang(
    peminjaman_id: str,
    tanggal_kembali: str = Form(...),
    kondisi: str = Form(...),
    catatan: str = Form(""),
    foto: UploadFile = File(None),
):
    # Baca file JSON peminjaman
    with open("peminjaman.json", "r") as f:
        peminjaman_db = json.load(f)

    # Cari peminjaman sesuai id
    peminjaman = next((p for p in peminjaman_db if p["id"] == peminjaman_id), None)
    if not peminjaman:
        raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

    # Simpan foto bila ada
    foto_path = None
    if foto:
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        foto_path = os.path.join(upload_dir, f"{uuid4()}_{foto.filename}")
        with open(foto_path, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)

    # Data pengembalian
    pengembalian_data = {
        "tanggal_pengembalian": tanggal_kembali,
        "kondisi_barang": kondisi,
        "catatan": catatan,
        "foto": foto_path,
    }

    # Update status peminjaman
    peminjaman["status"] = "Menunggu Verifikasi"
    peminjaman["tanggal_kembali"] = tanggal_kembali
    peminjaman["pengembalian"] = pengembalian_data

    # Simpan kembali ke JSON
    with open("peminjaman.json", "w") as f:
        json.dump(peminjaman_db, f, indent=2)

    return {
        "message": "Pengembalian berhasil dicatat",
        "pengembalian": pengembalian_data,
    }

@app.get("/pengembalian/{peminjaman_id}")
async def get_pengembalian(peminjaman_id: str):
    try:
        with open("peminjaman.json", "r") as f:
            peminjaman_db = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Database peminjaman tidak ditemukan")

    # cari peminjaman sesuai id
    peminjaman = next((p for p in peminjaman_db if p["id"] == peminjaman_id), None)
    if not peminjaman:
        raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

    # kalau belum ada data pengembalian
    if "pengembalian" not in peminjaman or not peminjaman["pengembalian"]:
        raise HTTPException(status_code=404, detail="Belum ada data pengembalian")

    return peminjaman["pengembalian"]

@app.get("/peminjaman/{peminjaman_id}")
async def get_peminjaman(peminjaman_id: str):
    try:
        with open("peminjaman.json", "r") as f:
            peminjaman_db = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Database peminjaman tidak ditemukan")

    peminjaman = next((p for p in peminjaman_db if p["id"] == peminjaman_id), None)
    if not peminjaman:
        raise HTTPException(status_code=404, detail="Peminjaman tidak ditemukan")

    return peminjaman


