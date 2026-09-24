import subprocess
import sys
import os

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("🚀 Starting CyberXDelta IAM Assessment Platform...")
    print("🔹 Backend: http://127.0.0.1:8000 (API Docs: http://127.0.0.1:8000/docs)")
    print("🔹 Frontend: http://localhost:5173\n")

    # Start backend
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    backend_cmd = [npm_cmd, "run", "dev"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # Start frontend
    # On Windows, npm is npm.cmd
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping all servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
