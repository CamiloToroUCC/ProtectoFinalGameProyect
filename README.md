// Proyecto Final: Evaluación de Calidad de un Proyecto Frontend y Backend en React

Este proyecto integra un juego desarrollado en React y un backend en Node.js/Express con MongoDB. Se aplicaron conceptos de calidad de software (como ISO/IEC 25010) mediante:

- **Pruebas Unitarias** con Vitest (para el módulo *GameTracker.js*).  
- **Pruebas de Integración** con Postman.  
- **Pruebas de Sistema** con JMeter.  
- **Automatización CI/CD** usando Jenkins, configurado con un pipeline que resuelve problemas comunes.  
- **Exposición del Pipeline** mediante Ngrok para activar webhooks en GitHub.  
- **Despliegue del Frontend** en Vercel.

---

## 1. Organización del Proyecto

El proyecto se divide en dos áreas:

### 1.1 Backend

**Tecnologías**  
- Node.js  
- Express  
- MongoDB  

**Archivos principales**  
- `app.js` (conexión a MongoDB, definición de endpoints, arranque del servidor)  
- `.env` (variables: `MONGO_URI`, `PORT`, `API_URL`)  

### 1.2 Frontend (game-project)

**Tecnologías**  
- React  
- Vite  

**Archivos principales**  
- `vite.config.js`  
- `.env` (por ejemplo, `VITE_API_URL=http://localhost:3001`)  
- Pruebas unitarias en `src/Experience/__tests__/GameTracker.test.js`  

**Estructura sugerida del repositorio**  
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

### 2.1 Instalación y Ejecución

1. Instalar MongoDB (por ejemplo, MSI) y, de ser necesario, iniciar el servicio:
   ```bash
   net start MongoDB
   ```
2. Archivo `/backend/.env` (contenido real):
   ```dotenv
   MONGO_URI=mongodb://127.0.0.1:27017/threejs_blocks
   PORT=3001
   API_URL=http://localhost:3001/api/blocks/batch
   ```
3. Código en `app.js`:
   ```javascript
   const express = require('express');
   const mongoose = require('mongoose');
   const dotenv = require('dotenv');
   dotenv.config();

   const app = express();
   const port = process.env.PORT || 3001;

   mongoose.connect(process.env.MONGO_URI)
     .then(() => {
       console.log('✅ Conectado a MongoDB');
       app.listen(port, () => {
         console.log(`✅ Servidor corriendo en http://localhost:${port}`);
       });
     })
     .catch(err => console.error('Error al conectar a MongoDB:', err));

   // Endpoint de prueba
   app.get("/api/blocks/ping", (req, res) => res.json({ message: "pong" }));
   ```

---

## 3. Configuración del Frontend

### 3.1 Instalación y Variables de Entorno

1. Clonar el repositorio y acceder al frontend:
   ```bash
   git clone https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git
   cd ProtectoFinalGameProyect/game-project
   ```
2. Archivo `/game-project/.env`:
   ```dotenv
   VITE_API_URL=http://localhost:3001
   ```
3. Instalación y ejecución:
   ```bash
   npm install
   npm run dev
   ```
   La aplicación se ejecutará en `http://localhost:5173`.

---

## 4. Pruebas Unitarias con Vitest (GameTracker)

El archivo de pruebas se encuentra en `game-project/src/Experience/__tests__/GameTracker.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameTracker from '../Utils/GameTracker';

const fakeModal = { show: vi.fn(), hide: vi.fn() };
const fakeMenu = { setTimer: vi.fn() };

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Pruebas unitarias para GameTracker', () => {
  let tracker;
  beforeEach(() => { tracker = new GameTracker({ modal: fakeModal, menu: fakeMenu }); });

  it('debe inicializar con startTime en null y finished en false', () => {
    expect(tracker.startTime).toBeNull();
    expect(tracker.finished).toBe(false);
  });

  it('start() debería asignar startTime y llamar a menu.setTimer', (done) => {
    tracker.start();
    setTimeout(() => {
      expect(tracker.startTime).not.toBeNull();
      expect(fakeMenu.setTimer).toHaveBeenCalled();
      tracker.finished = true;
      done();
    }, 1100);
  });

  it('stop() marca finished y retorna tiempo ≥ 1s', (done) => {
    tracker.start();
    setTimeout(() => {
      const elapsed = tracker.stop();
      expect(tracker.finished).toBe(true);
      expect(elapsed).toBeGreaterThanOrEqual(1);
      done();
    }, 1100);
  });

  it('getElapsedSeconds() calcula el tiempo correctamente', (done) => {
    tracker.start();
    setTimeout(() => {
      const elapsed = tracker.getElapsedSeconds();
      expect(elapsed).toBeGreaterThanOrEqual(1);
      tracker.finished = true;
      done();
    }, 1100);
  });

  it('saveTime() y getBestTimes() almacenan y ordenan tiempos', () => {
    tracker.saveTime(15);
    tracker.saveTime(10);
    tracker.saveTime(20);
    let bestTimes = tracker.getBestTimes();
    expect(bestTimes).toEqual([10, 15, 20]);
    tracker.saveTime(5);
    tracker.saveTime(8);
    tracker.saveTime(12);
    bestTimes = tracker.getBestTimes();
    expect(bestTimes.length).toBeLessThanOrEqual(5);
    expect(bestTimes[0]).toBe(5);
  });

  it('showEndGameModal() invoca modal.show con mensaje correcto', () => {
    localStorage.setItem('bestTimes', JSON.stringify([7, 12, 9]));
    tracker.showEndGameModal(12);
    expect(fakeModal.show).toHaveBeenCalled();
    const arg = fakeModal.show.mock.calls[0][0];
    expect(arg.message).toContain('12s');
    expect(arg.message).toContain('#1:');
  });
});
```

> Referencia: Guía de Pruebas Unitarias con Vitest

---

## 5. Pruebas de Integración con Postman

### 5.1 Endpoints a Probar

- **GET** `/api/blocks/ping`  
  URL: `http://localhost:3001/api/blocks/ping`  
  Respuesta esperada: `{ "message": "pong" }`

- **GET** `/api/blocks`  
  Obtener lista de bloques.

- **POST** `/api/blocks`  
  Body:
  ```json
  { "name": "block_test_1", "x": 10, "y": 20, "z": 30 }
  ```

- **POST** `/api/blocks/batch`  
  Body:
  ```json
  [
    { "name": "block1", "x": 1, "y": 1, "z": 1 },
    { "name": "block2", "x": 2, "y": 2, "z": 2 },
    { "name": "block3", "x": 3, "y": 3, "z": 3 }
  ]
  ```

_Evidencia:_ Exportación de colección y capturas de respuestas.

> Referencia: Guía de Integración Continua con Jenkins y Postman

---

## 6. Pruebas de Sistema con JMeter

### 6.1 Configuración de JMeter

- **Thread Group:** 5 usuarios, 10 s de ramp-up, 10 iteraciones  
- **HTTP Request Defaults:** protocolo `http`, servidor `localhost`, puerto `3001`  
- **HTTP Header Manager:** `Content-Type: application/json`, `Accept: application/json`  
- **Samplers:** GET `/api/blocks/ping`, GET `/api/blocks`, POST `/api/blocks`, POST `/api/blocks/batch`  
- **Listeners:** View Results Tree, Aggregate Report, Summary Report  
  (objetivo: respuesta promedio < 5 s)

_Evidencia:_ Capturas del Test Plan y reportes generados.

> Referencia: Guía de Pruebas de Sistema con JMeter

---

## 7. Automatización CI/CD con Jenkins

### 7.1 Jenkinsfile Real

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

### 7.2 Errores y Soluciones en el Pipeline

- **Ngrok apagado**: el webhook no se disparaba → reiniciar ngrok y actualizar Payload URL en GitHub.  
- **Push devolvía 404 (ERR_NGROK_3200)**: endpoint `/github-webhook/` no atendido → configurar plugin de Webhook en Jenkins y asegurar servicio en puerto 8080.  
- **Cambio de URL de ngrok**: cada reinicio genera nueva URL → actualizar Payload URL a  
  `https://2361-191-95-166-234.ngrok-free.app/github-webhook/`  
- **Commit vacío** para forzar entrega en “Recent Deliveries” de GitHub y verificar status 200.

> Referencia: Guía de Integración Continua con Jenkins

---

## 8. Exposición del Pipeline con Ngrok y Webhook

### 8.1 Configuración de Ngrok

```powershell
& "C:\ProgramData\chocolatey\lib\ngrok\tools\ngrok.exe" http 8080
```

- URL de Forwarding obtenida:  
  `https://2361-191-95-166-234.ngrok-free.app`

- Payload URL en GitHub →  
  `https://2361-191-95-166-234.ngrok-free.app/github-webhook/`

### 8.2 Validación

1. Acceder a `https://2361-191-95-166-234.ngrok-free.app` para ver interfaz de Jenkins.  
2. Hacer commit y push; verificar en GitHub (Recent Deliveries) y Jenkins que pipeline se active.

---

## 9. Despliegue del Frontend en Vercel

### 9.1 Pasos para el Despliegue

1. Iniciar sesión en Vercel y “Import Project” con:  
   `https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git`  
2. Rama: `main`  
3. Configuración:  
   - **Project Name:** protecto-final-game-proyect  
   - **Root Directory:** `game-project`  
   - **Build Command:** `vite build`  
   - **Output Directory:** `dist`  
   - **Environment Variables:**  
     ```
     VITE_API_URL=http://localhost:3001
     ```  
4. Hacer clic en “Deploy” y esperar URL pública final (ej. `https://game-project-xyz.vercel.app`).

---

## 10. Instrucciones de Uso Final

1. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git
   ```
2. **Backend**  
   ```bash
   cd ProtectoFinalGameProyect/backend
   npm install
   npm start
   ```
3. **Frontend**  
   ```bash
   cd ../game-project
   npm install
   npm run dev
   ```
4. **Pruebas Unitarias**  
   ```bash
   npm run test
   ```
5. **Pipeline CI/CD**  
   - Asegurarse de que ngrok esté activo:  
     ```powershell
     & "C:\ProgramData\chocolatey\lib\ngrok\tools\ngrok.exe" http 8080
     ```  
   - Actualizar Payload URL si cambia la dirección de ngrok.  
   - Hacer push para disparar pipeline y verificar en GitHub (Recent Deliveries).

6. **Despliegue en Vercel**  
   Cada push a `main` actualiza el despliegue automáticamente.

---

## 11. Conclusiones y Lecciones Aprendidas

- **Integración Completa:** Backend, frontend, pruebas unitarias (Vitest), integración (Postman), sistema (JMeter) y CI/CD en Jenkins.  
- **Manejo de Errores:** ngrok, webhooks y configuración dinámica de URL.  
- **Despliegue Automático:** Vercel configurado correctamente para React/Vite.  
- **Documentación:** Proceso detallado que refleja la aplicación de normas de calidad ISO/IEC 25010.  
