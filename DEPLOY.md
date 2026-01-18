# QnAi Deployment Guide

This guide covers deploying the **Frontend to Vercel** and the **Backend to a Vultr VPS**.

## Prerequisites

- **Vercel Account**: For frontend hosting.
- **Vultr Account**: For backend VPS.
- **Domain Name** (Optional but recommended): For SSL/HTTPS on the backend.

---

## Part 1: Backend Deployment (Vultr)

Since you are hosting the backend and database yourself, you need to set up the environment.

### 1.1 Server Setup (Ubuntu 22.04/24.04 recommended)

SSH into your Vultr server:
```bash
ssh root@your_vultr_ip
```

Update system:
```bash
apt update && apt upgrade -y
```

### 1.2 Install Node.js (v20+)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.3 Install MongoDB (Use Docker for simplest setup)
Install Docker:
```bash
curl -fsSL https://get.docker.com | sh
```

Run MongoDB container:
```bash
docker run -d --name mongodb -p 27017:27017 -v mongo-data:/data/db mongo:latest
```

### 1.4 Setup Project
Clone your repository (or upload files via SFTP/SCP):
```bash
git clone <your-repo-url> qnai
cd qnai
```

Install Backend Dependencies:
```bash
npm install
```

### 1.5 Configuration (.env)
Create a `.env` file in the root directory:
```bash
nano .env
```
Paste your environment variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/qnai
JWT_SECRET=your_secure_random_secret_here
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
CLIENT_URL=https://your-vercel-project.vercel.app  <-- Update this after Part 2
```

### 1.6 Run with PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "qnai-api"
pm2 save
pm2 startup
```

### 1.7 (Recommended) Setup Nginx & SSL
Install Nginx:
```bash
apt install nginx -y
```
Create config:
```bash
nano /etc/nginx/sites-available/qnai
```
Content:
```nginx
server {
    server_name your-api-domain.com; # Or your IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```
Enable site:
```bash
ln -s /etc/nginx/sites-available/qnai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 1.8 Setup SSL with Certbot (HTTPS)
Install Certbot and the Nginx plugin:
```bash
apt install certbot python3-certbot-nginx -y
```

Obtain and install the certificate:
```bash
certbot --nginx -d your-api-domain.com
```
- Enter your email when prompted.
- Agree to terms.
- **Select '2'** to redirect HTTP to HTTPS (Recommended).

Verify Auto-Renewal:
Certbot sets up a timer automatically. Test it:
```bash
certbot renew --dry-run
```

---

## Part 2: Frontend Deployment (Vercel)

### 2.1 Import Project
1. Log in to Vercel.
2. Click **"Add New..."** > **"Project"**.
3. Import your Git repository.

### 2.2 Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `client` (Important! Click "Edit" and select the `client` folder)

### 2.3 Environment Variables
Expand **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `http://<your_vultr_ip_or_domain>/api` (No trailing slash) |

> **Note**: If your backend is HTTP (no SSL), your frontend (HTTPS on Vercel) might block requests due to "Mixed Content".
> **Solution**: You MUST set up SSL on your backend (Step 1.7) OR use HTTP for both (not recommended).

### 2.4 Deploy
Click **Deploy**.

---

## Part 3: Final Link
Once Vercel deploys, copy the **Vercel Domain** (e.g., `https://qnai.vercel.app`).

1. Go back to your Vultr server.
2. Edit `.env`:
   ```bash
   CLIENT_URL=https://qnai.vercel.app
   ```
3. Restart backend:
   ```bash
   pm2 restart qnai-api
   ```

Done! 🚀
