# MachineLink – Industrial IoT Cloud Platform
## Project Documentation
**Course:** B.Tech CSE 2024–2028 | Semester IV  
**Subject:** Amazon Web Services – Case Study / Problem Statement  
**Problem Statement No.:** 73 – MachineLink Industrial IoT Cloud  
**Industry:** Industrial IoT & Machine Connectivity

---

## 1. PURPOSE OF THIS PROJECT

### Problem Being Solved
Manufacturing floors depend on isolated spreadsheets and manual checks to track machine health. There is no centralized view, no real-time alerting, and no scalable cloud infrastructure. Machines overheat, RPM spikes go unnoticed, and downtime happens without warning.

### What MachineLink Does
MachineLink is a cloud-based Industrial IoT Monitoring Platform that:
- Centralizes machine data (Temperature, RPM, Voltage, Current, Status) in one dashboard
- Runs a background telemetry simulator to generate real sensor data every 5 seconds
- Automatically triggers alerts when thresholds are breached (Temp > 85°C, RPM > 4500)
- Provides role-based access (Admin vs Operator)
- Is fully containerized with Docker and deployable on AWS EC2 + RDS

### How It Covers Problem Statement 73
| Requirement from PS | How Project Addresses It |
|---|---|
| Centralized cloud platform | React SPA + Express API deployed on AWS EC2 |
| Analytics & reporting | Dashboard KPIs, Recharts time-series graphs |
| Secure access control | JWT authentication, Admin/Operator roles |
| Monitoring & alerting | Telemetry simulator + alert engine |
| Scalability | Docker containers, AWS RDS for DB scaling |
| Cloud databases (MySQL) | MySQL via AWS RDS in production |
| Disaster recovery readiness | AWS RDS automated backups, multi-AZ support |
| Docker & containerization | Docker + Docker Compose for all 3 services |
| Cloud VM deployment | EC2 instance with SSH, systemctl, SCP |
| Cloud networking | VPC, Security Groups, public/private subnets |
| Monitoring & resource management | AWS CloudWatch agent integration |
| Pricing strategy | AWS Free Tier + RDS t3.micro cost discussed in README |

---

## 2. PROJECT STRUCTURE & WHAT EACH FILE DOES

```
machinelink/
├── schema.sql                          # Database tables + seed data
├── docker-compose.yml                  # Orchestrates all 3 containers
├── README.md                           # Full deployment guide
├── PROJECT_DOCUMENTATION.md            # This file
│
├── backend/
│   ├── server.js                       # App entry point, starts Express + DB + Simulator
│   ├── .env                            # Environment variables (DB, JWT, Port)
│   ├── Dockerfile                      # Containerizes the Node.js backend
│   ├── package.json                    # Node dependencies list
│   │
│   ├── config/
│   │   └── db.js                       # MySQL connection pool using mysql2
│   │
│   ├── models/
│   │   ├── userModel.js                # DB queries for users, bcrypt password hashing
│   │   ├── machineModel.js             # CRUD queries for machines table
│   │   ├── metricModel.js              # Insert/fetch telemetry rows
│   │   └── alertModel.js              # Create/resolve/fetch alerts
│   │
│   ├── controllers/
│   │   ├── authController.js           # Handles login, generates JWT token
│   │   ├── machineController.js        # CRUD logic for machine management
│   │   ├── metricController.js         # Returns telemetry data for charts
│   │   ├── alertController.js          # Returns active alerts, resolves them
│   │   └── dashboardController.js      # Aggregates KPIs (totals, avg temp, avg RPM)
│   │
│   ├── routes/
│   │   ├── authRoutes.js               # POST /api/auth/login
│   │   ├── machineRoutes.js            # GET/POST/PUT/DELETE /api/machines
│   │   ├── metricRoutes.js             # GET /api/metrics, GET /api/metrics/:id
│   │   ├── alertRoutes.js              # GET /api/alerts, PUT /api/alerts/:id/resolve
│   │   └── dashboardRoutes.js          # GET /api/dashboard/stats
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification, role-based access guard
│   │   └── errorMiddleware.js          # Centralized error response formatter
│   │
│   ├── services/
│   │   └── telemetrySimulator.js       # Runs every 5s: generates sensor data, triggers alerts
│   │
│   └── utils/
│       └── logger.js                   # Console logger with timestamps (INFO/WARN/ERROR)
│
└── frontend/
    ├── Dockerfile                      # Containerizes the React frontend (Vite dev server)
    ├── package.json                    # Frontend dependencies (React, Recharts, Axios, etc.)
    ├── tailwind.config.js              # Dark theme color palette configuration
    ├── vite.config.js                  # Vite bundler settings
    │
    └── src/
        ├── main.jsx                    # React DOM root entry point
        ├── App.jsx                     # Root component: session guard, routing, data polling
        ├── api.js                      # Axios client with JWT interceptors, all API functions
        ├── index.css                   # Tailwind imports + global dark theme base styles
        │
        ├── components/
        │   ├── Sidebar.jsx             # Collapsible left nav: logo, menu, user profile, logout
        │   ├── Navbar.jsx              # Top bar: page title, alert badge, sync button
        │   └── Layout.jsx             # Wrapper combining Sidebar + Navbar + main content
        │
        └── pages/
            ├── Login.jsx               # Login form with JWT auth, error handling
            ├── Dashboard.jsx           # KPI cards, pie chart, alerts panel, machine grid
            ├── Machines.jsx            # Machine list with search/filter + CRUD modals
            ├── Analytics.jsx           # Temperature & RPM time-series area charts (Recharts)
            └── Settings.jsx            # Threshold config UI, notification toggles, user profile
```

---

## 3. KEY TECHNOLOGIES USED

| Technology | Role |
|---|---|
| **React + Vite** | Frontend SPA framework |
| **Tailwind CSS** | Dark-themed utility CSS |
| **Recharts** | Temperature & RPM chart graphs |
| **Axios** | HTTP client with JWT interceptors |
| **Node.js + Express** | REST API backend (MVC architecture) |
| **MySQL** | Relational database (local dev + AWS RDS) |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **bcryptjs** | Password hashing |
| **Docker** | Container images for all services |
| **Docker Compose** | Multi-container orchestration |
| **AWS EC2** | Virtual machine to host backend + frontend |
| **AWS RDS** | Managed MySQL database (production) |
| **AWS CloudWatch** | Server and application log monitoring |

---

## 4. AWS SERVICES & COMMANDS

### 4.1 AWS EC2 – Virtual Machine Setup

```bash
# Connect to your EC2 instance via SSH
ssh -i "your-key.pem" ubuntu@<EC2_PUBLIC_IP>

# Update packages on EC2
sudo apt update && sudo apt upgrade -y

# Install Docker on EC2
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose on EC2
sudo curl -L \
  "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Copy project files from local machine to EC2 using SCP
scp -i "your-key.pem" -r ./machinelink ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/

# Run Docker Compose on EC2 (points to RDS endpoint, not local MySQL)
cd machinelink
docker compose up --build -d

# Check running containers
docker ps

# Check backend logs
docker logs machinelink_backend

# Restart a container
docker restart machinelink_backend
```

### 4.2 AWS RDS – Managed MySQL Database

```bash
# After creating RDS MySQL instance in AWS Console:
# - Engine: MySQL 8.0
# - Instance: db.t3.micro (Free Tier)
# - DB name: machinelink
# - Enable automated backups (7-day retention)
# - Multi-AZ: optional for HA

# Import schema into RDS from local machine
mysql -h <RDS_ENDPOINT> -u root -p machinelink < schema.sql

# Test connection to RDS
mysql -h <RDS_ENDPOINT> -u root -p -e "SHOW DATABASES;"

# Update backend .env to use RDS endpoint
# DB_HOST=machinelink-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=machinelink
```

### 4.3 AWS Security Groups – Network Firewall Rules

```
EC2 Security Group (sg-machinelink-ec2):
  Inbound:  HTTP  port 80   → 0.0.0.0/0   (public web access)
  Inbound:  HTTPS port 443  → 0.0.0.0/0   (HTTPS if SSL configured)
  Inbound:  SSH   port 22   → YOUR_IP/32  (admin only)
  Inbound:  TCP   port 5173 → 0.0.0.0/0   (Vite frontend)
  Inbound:  TCP   port 5001 → 0.0.0.0/0   (Express API)

RDS Security Group (sg-machinelink-rds):
  Inbound:  MySQL port 3306 → sg-machinelink-ec2 (EC2 only, not public)
```

### 4.4 AWS CloudWatch – Monitoring & Logs

```bash
# Install CloudWatch Agent on EC2
sudo apt-get install amazon-cloudwatch-agent -y

# Start CloudWatch Agent with config
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

# Monitor Docker container logs via CloudWatch
# Set up log stream in config.json to tail:
# /var/lib/docker/containers/*/*-json.log

# View metrics in AWS Console:
# CloudWatch → Log Groups → MachineLink-EC2-Syslog
```

### 4.5 Linux Administration Commands (on EC2)

```bash
# Check system resource usage
top
htop
df -h          # Disk usage
free -m        # Memory usage

# Manage application process
systemctl status docker
systemctl restart docker

# View application logs
docker logs machinelink_backend -f
docker logs machinelink_frontend

# File deployment via SCP
scp -i key.pem ./backend/.env ubuntu@<EC2_IP>:/home/ubuntu/machinelink/backend/

# File sync via Git
git clone https://github.com/yourusername/machinelink.git
git pull origin main

# Cron job for daily DB backup
crontab -e
# Add: 0 2 * * * mysqldump -h <RDS_ENDPOINT> -u root -p machinelink > /backup/db_$(date +\%F).sql
```

---

## 5. API ENDPOINTS SUMMARY

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/machines` | JWT | List all machines + latest metrics |
| POST | `/api/machines` | Admin | Register new machine |
| PUT | `/api/machines/:id` | Admin | Update machine details |
| DELETE | `/api/machines/:id` | Admin | Delete machine |
| GET | `/api/metrics` | JWT | All telemetry rows |
| GET | `/api/metrics/:machineId` | JWT | Telemetry for one machine |
| GET | `/api/alerts` | JWT | Active/resolved alerts |
| PUT | `/api/alerts/:id/resolve` | Admin | Resolve an alert |
| GET | `/api/dashboard/stats` | JWT | KPIs, status distribution, recent alerts |

---

## 6. HOW TO RUN LOCALLY

```bash
# 1. Start MySQL (if using Homebrew)
brew services start mysql

# 2. Import schema
mysql -u root < schema.sql

# 3. Start Backend
cd backend && npm install && npm run dev

# 4. Start Frontend (new terminal)
cd frontend && npm install && npm run dev

# Open: http://localhost:5173
# Login: admin / admin123
```

## 7. HOW TO RUN WITH DOCKER

```bash
# From project root
docker compose up --build

# Services:
# Frontend → http://localhost:5173
# Backend  → http://localhost:5001
# MySQL    → localhost:3306
```

---

## 8. IS THIS PROJECT ONLY FOR AWS (Problem 73)?

**YES — this project is 100% mapped to Problem Statement 73 (AWS).**  
It does NOT overlap with or implement anything from Problem Statement 8 (DevOps – Digital Certification Management System).

Project 8 requires entirely different technologies:
- Jenkins CI/CD pipelines
- Kubernetes orchestration  
- Terraform infrastructure-as-code
- Prometheus + Grafana monitoring
- GitHub Actions workflows

None of those are part of this MachineLink codebase. The two projects are cleanly separated.

**MachineLink = AWS Problem 73 only. ✅**

---

*Generated for ITM Skills University B.Tech CSE 2024–2028, Semester IV*
