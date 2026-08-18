import os, sys
sys.path.insert(0, "video_modules/flowkit")
import uvicorn
from agent.config import API_HOST, API_PORT

if __name__ == "__main__":
    uvicorn.run("agent.main:app", host=API_HOST, port=API_PORT, reload=False, log_level="info")
