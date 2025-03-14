# 🚀 AI Product Search Application - Kubernetes Deployment Guide

## **Table of Contents**
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Testing the Deployment](#testing-the-deployment)
7. [Monitoring & Logging (Optional)](#monitoring--logging-optional)
8. [Troubleshooting](#troubleshooting)
9. [Future Improvements](#future-improvements)

---

## **1️⃣ Introduction**
This project is an **AI-powered product search application** designed for e-commerce platforms. It uses:
- **FastAPI** for the backend (AI-based search API).
- **React** for the frontend (User Interface).
- **Elasticsearch** for product search indexing.
- **Docker & Kubernetes** for scalable deployment.
- **GitHub Actions** for CI/CD automation.

---

## **2️⃣ Project Structure**
```
ai-product-search/
│── backend/             # FastAPI backend service
│── frontend/            # React-based frontend
│── infrastructure/      # Kubernetes manifests & Terraform scripts
│── monitoring/          # Monitoring setup (Prometheus, Grafana)
│── .github/             # GitHub Actions (CI/CD)
│── README.md            # Documentation
```

---

## **3️⃣ Prerequisites**
Before deployment, ensure you have the following:
✅ **Kubernetes Cluster** (EKS/GKE/AKS or Minikube)  
✅ **Docker Installed**  
✅ **kubectl Configured**  
✅ **A Container Registry** (Docker Hub, AWS ECR, GCP GCR)  

---

# **📌 4️⃣ Backend Deployment**

### **Step 1: Create `requirements.txt`**
Inside the `backend/` directory, create `requirements.txt`:
```bash
cd backend
nano requirements.txt
```
Paste:
```
fastapi
uvicorn
elasticsearch
sentence-transformers
```
Save & exit (**CTRL + X, then Y, then Enter**).

### **Step 2: Create `Dockerfile`**
Create `backend/Dockerfile`:
```dockerfile
# Use official Python image
FROM python:3.9

# Set working directory
WORKDIR /app

# Copy application files
COPY main.py .
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Step 3: Build & Push Docker Image**
```bash
cd backend
docker build -t your-dockerhub-username/backend:latest .
docker tag your-dockerhub-username/backend:latest your-dockerhub-username/backend:v1
docker login
docker push your-dockerhub-username/backend:v1
```
🔹 Replace **`your-dockerhub-username`** with your actual Docker Hub username.

### **Step 4: Deploy Elasticsearch**
Create `infrastructure/k8s/elasticsearch-deployment.yml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elasticsearch
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
        - name: elasticsearch
          image: docker.elastic.co/elasticsearch/elasticsearch:7.10.1
          ports:
            - containerPort: 9200
          env:
            - name: discovery.type
              value: "single-node"
            - name: xpack.security.enabled
              value: "false"
---
apiVersion: v1
kind: Service
metadata:
  name: elasticsearch
spec:
  selector:
    app: elasticsearch
  ports:
    - protocol: TCP
      port: 9200
      targetPort: 9200
  type: ClusterIP
```
Apply the deployment:
```bash
kubectl apply -f infrastructure/k8s/elasticsearch-deployment.yml
```

### **Step 5: Deploy Backend**
Create `infrastructure/k8s/backend-deployment.yml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: your-dockerhub-username/backend:v1
          ports:
            - containerPort: 8000
          env:
            - name: ELASTICSEARCH_URL
              value: "http://elasticsearch:9200"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
```
Deploy it:
```bash
kubectl apply -f infrastructure/k8s/backend-deployment.yml
```

---

# **📌 5️⃣ Frontend Deployment**

### **Step 1: Create `Dockerfile`**
Inside the `frontend/` directory, create `Dockerfile`:
```dockerfile
# Use Node.js to build
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Use Nginx to serve React app
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Step 2: Build & Push Docker Image**
```bash
cd frontend
docker build -t your-dockerhub-username/frontend:latest .
docker push your-dockerhub-username/frontend:latest
```

### **Step 3: Deploy Frontend**
Create `infrastructure/k8s/frontend-deployment.yml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: your-dockerhub-username/frontend:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```
Deploy it:
```bash
kubectl apply -f infrastructure/k8s/frontend-deployment.yml
```

---

# **📌 6️⃣ Testing the Deployment**
Find backend service IP:
```bash
kubectl get svc backend
```
Test API:
```bash
curl http://backend-service-ip/search?query="laptop"
```

Find frontend service IP:
```bash
kubectl get svc frontend
```
Open the frontend **LoadBalancer IP** in a browser.

---

# **📌 7️⃣ Monitoring & Logging (Optional)**
Deploy Prometheus:
```bash
kubectl apply -f monitoring/prometheus.yml
```
Access:
```bash
kubectl port-forward svc/prometheus 9090:9090
```

---

# **📌 8️⃣ Troubleshooting**
Check logs:
```bash
kubectl logs pod-name
```
Check running pods:
```bash
kubectl get pods
```

---

# **📌 9️⃣ Future Improvements**
- ✅ Add **auto-scaling**
- ✅ Secure with **TLS & RBAC**
- ✅ Optimize **Elasticsearch for faster search**
- ✅ Deploy **CI/CD with GitHub Actions**

---

# 🎉 **Congratulations!**
Your **AI-powered search application** is now running on **Kubernetes**. 🚀🔥

Would you like help with **auto-scaling, monitoring, or optimizations**? 🚀
