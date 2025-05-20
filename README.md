# Proyecto Final: Evaluación de Calidad de un Proyecto Frontend y Backend en React

**Universidad Cooperativa de Colombia**  
**Asignatura:** Calidad de Software  
**Grupo:** [Incluir nombres completos e ID de los integrantes]  
**Escenario Asignado:** Juego desarrollado como experiencia inmersiva para museos interactivos.  
**Módulo de prueba unitaria:** `GameTracker.js`  

---

## 1. Organización del Proyecto

### 1.1 Backend

**Tecnologías:**  
- Node.js  
- Express  
- MongoDB  

**Archivos principales:**  
- `app.js`: conexión a MongoDB, endpoints, arranque del servidor  
- `.env`:  
```env
MONGO_URI=mongodb://127.0.0.1:27017/threejs_blocks  
PORT=3001  
API_URL=http://localhost:3001/api/blocks/batch
```

### 1.2 Frontend (game-project)

**Tecnologías:**  
- React  
- Vite  

**Archivos principales:**  
- `vite.config.js`  
- `.env`:  
```env
VITE_API_URL=http://localhost:3001
```
- Pruebas unitarias: `src/Experience/__tests__/GameTracker.test.js`

**Estructura del repositorio:**  
```
/backend
├── app.js
└── .env

/game-project
├── src/
│   └── Experience/
│       └── __tests__/
│           └── GameTracker.test.js
├── vite.config.js
└── .env
```

---

## 2. Configuración del Backend

### 2.1 Instalación y ejecución

```bash
net start MongoDB
cd backend
npm install
npm start
```

El backend estará activo en: `http://localhost:3001`

---

## 3. Configuración del Frontend

### 3.1 Clonación, instalación y ejecución

```bash
git clone https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git
cd ProtectoFinalGameProyect/game-project
npm install
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 4. Pruebas Unitarias con Vitest (GameTracker)

Archivo: `game-project/src/Experience/__tests__/GameTracker.test.js`

[Incluye aquí el código completo del test que ya tienes.]

> Las pruebas validan inicialización, control de tiempo, almacenamiento y ranking de partidas.

---

## 5. Pruebas de Integración con Postman

### Endpoints probados:

- `GET /api/blocks/ping` → Respuesta esperada: `{ "message": "pong" }`  
- `GET /api/blocks`  
- `POST /api/blocks`  
  ```json
  { "name": "block_test_1", "x": 10, "y": 20, "z": 30 }
  ```
- `POST /api/blocks/batch`  
  ```json
  [
    { "name": "block1", "x": 1, "y": 1, "z": 1 },
    { "name": "block2", "x": 2, "y": 2, "z": 2 },
    { "name": "block3", "x": 3, "y": 3, "z": 3 }
  ]
  ```

> Evidencia: Colección exportada y capturas de Postman.

---

## 6. Pruebas de Sistema con JMeter

### Configuración:

- **Usuarios:** 5  
- **Ramp-up:** 10 segundos  
- **Iteraciones:** 10  
- **Endpoints incluidos:** Todos los anteriores  
- **Listeners usados:**  
  - View Results Tree  
  - Aggregate Report  
  - Summary Report  

> Resultado: Todos los endpoints respondieron en < 5 segundos promedio.

---

## 7. Automatización CI/CD con Jenkins

### Jenkinsfile

```groovy
pipeline {
    agent any
    environment {
        CI = "false"
        VERCEL_TOKEN = "LR3pXpyR2FCj7tZ7kOcldVes"
    }
    tools {
        nodejs 'Node 20'
    }
    stages {
        stage('Clean workspace') {
            steps { deleteDir() }
        }
        stage('Checkout') {
            steps {
                git url: 'https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git', 
                    branch: 'main',
                    credentialsId: 'github-token'
            }
        }
        stage('Install dependencies') {
            steps {
                dir('game-project') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }
        stage('Run GameTracker Unit Tests') {
            steps {
                dir('game-project') {
                    bat 'npx vitest run src/Experience/__tests__/GameTracker.test.js'
                }
            }
        }
        stage('Build app') {
            steps {
                dir('game-project') {
                    bat 'npm run build'
                }
            }
        }
        stage('Deploy to Vercel') {
            steps {
                dir('game-project') {
                    bat 'npx vercel --prod --yes --token %VERCEL_TOKEN%'
                }
            }
        }
    }
}
```

### Errores resueltos:

- **Ngrok inactivo:** no se disparaba el webhook → Se reactivó y actualizó URL.  
- **404 en GitHub push:** se configuró correctamente `/github-webhook/` en Jenkins.  
- **Cambio de URL de Ngrok:** actualizada en GitHub a:  
  `https://2361-191-95-166-234.ngrok-free.app/github-webhook/`

---

## 8. Exposición del Pipeline con Ngrok y Webhook

### Comando para iniciar ngrok:

```powershell
& "C:\ProgramData\chocolatey\lib\ngrok\tools\ngrok.exe" http 8080
```

### URL generada:

`https://2361-191-95-166-234.ngrok-free.app`

### Payload URL configurada en GitHub:

`https://2361-191-95-166-234.ngrok-free.app/github-webhook/`

---

## 9. Despliegue del Frontend en Vercel

### Configuración:

- **Repositorio:** `https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git`  
- **Root directory:** `game-project`  
- **Build command:** `vite build`  
- **Output directory:** `dist`  
- **Environment variables:**  
  ```env
  VITE_API_URL=http://localhost:3001
  ```

> Vercel asignó una URL pública activa (ejemplo):  
> `https://game-project-nh8zyrc58-camilo-toros-projects.vercel.app`

---

## 10. Instrucciones de Uso

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd game-project
npm install
npm run dev
```

### Ejecutar pruebas unitarias

```bash
npm run test
```

---

## 11. Conclusiones y Lecciones Aprendidas

- El proyecto logró integrar pruebas automatizadas, pruebas de integración, sistema y un pipeline CI/CD funcional.  
- El uso de Ngrok permitió exponer Jenkins a GitHub de forma temporal y efectiva.  
- Se solucionaron errores como 404 en Webhooks, y se entendió la importancia del entorno de pruebas en despliegues reales.  
- La documentación y planificación basada en ISO/IEC 25010 fortaleció el enfoque en calidad estructurada del software.

---

## 12. Referencias

- Guía de Pruebas Unitarias con Vitest: https://asigcalidadsoftware.vercel.app/modules/semana6.html  
- Guía de Postman y CI: https://asigcalidadsoftware.vercel.app/modules/postman.html  
- Guía de JMeter: https://asigcalidadsoftware.vercel.app/modules/jmeter_5.html  
- Documento oficial del proyecto: [02Documento_Projecto_Final.pdf]
