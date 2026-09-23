# start_server.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",  # ganti "main" dengan nama file FastAPI Anda
        host="0.0.0.0",  # menerima koneksi dari semua IP
        port=8000,  # atau port yang Anda inginkan
        reload=False,  # nonaktifkan di production
        workers=4,  # jumlah worker untuk performance
        log_level="info"
    )