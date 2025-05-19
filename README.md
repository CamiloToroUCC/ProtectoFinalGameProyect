# Proyecto Final: Evaluación de Calidad de un Proyecto Frontend y Backend en React

Este proyecto integra un juego desarrollado en React y un backend en Node.js/Express con MongoDB. Se aplicaron conceptos de calidad de software (como ISO/IEC 25010) mediante:

- **Pruebas Unitarias** con Vitest (para el módulo *GameTracker.js*).  
- **Pruebas de Integración** con Postman.  
- **Pruebas de Sistema** con JMeter.  
- **Automatización CI/CD** usando Jenkins, configurado con un pipeline que resuelve problemas comunes.  
- **Exposición del Pipeline** mediante Ngrok para activar webhooks en GitHub.  
- **Despliegue del Frontend** en Vercel.

---

## Tabla de Contenidos

- [Organización del Proyecto](#organización-del-proyecto)  
- [Configuración del Backend](#configuración-del-backend)  
- [Configuración del Frontend](#configuración-del-frontend)  
- [Pruebas Unitarias con Vitest (GameTracker)](#pruebas-unitarias-con-vitest-gametracker)  
- [Pruebas de Integración (Postman)](#pruebas-de-integración-postman)  
- [Pruebas de Sistema (JMeter)](#pruebas-de-sistema-jmeter)  
- [Automatización CI/CD con Jenkins](#automatización-cicd-con-jenkins)  
  - [Jenkinsfile y Solución de Errores](#jenkinsfile-y-solución-de-errores)  
- [Exposición de Jenkins con Ngrok y Configuración del Webhook en GitHub](#exposición-de-jenkins-con-ngrok-y-configuración-del-webhook-en-github)  
- [Despliegue en Vercel](#despliegue-en-vercel)  
- [Instrucciones de Uso](#instrucciones-de-uso)  
- [Referencias](#referencias)  
- [Conclusiones y Consideraciones](#conclusiones-y-consideraciones)  

---

## Organización del Proyecto

El repositorio se divide en dos áreas:

- **Backend**  
  - Tecnologías: Node.js, Express, MongoDB.  
  - Archivos principales: `app.js`, `.env`

- **Frontend (game-project)**  
  - Tecnologías: React y Vite.  
  - Archivos principales: `vite.config.js`, `.env`, y las pruebas unitarias en `src/Experience/__tests__/GameTracker.test.js`

Estructura general del repositorio:

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

## Configuración del Backend

1. **Instalación de MongoDB:**  
   Se instaló MongoDB (por ejemplo, mediante MSI en Windows) y, si es necesario, se inicia con:  
   ```bash
   net start MongoDB
   ```
2. **Archivo `.env` en `/backend/.env`:**  
   ```bash
   MONGO_URI=mongodb://127.0.0.1:27017/threejs_blocks
   PORT=3001
   API_URL=http://localhost:3001/api/blocks/batch
   ```
3. **`app.js`:** Conexión a MongoDB y definición de endpoint básico:  
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

   app.get("/api/blocks/ping", (req, res) => res.json({ message: "pong" }));
   ```

---

## Configuración del Frontend

1. **Proyecto React con Vite:**  
   - Ubicación: `/game-project`  
   - Archivo `.env`:  
     ```bash
     VITE_API_URL=http://localhost:3001
     ```
2. **Instalación y ejecución:**  
   ```bash
   cd game-project
   npm install
   npm run dev
   ```
   La aplicación quedará corriendo en `http://localhost:5173`.

---

## Pruebas Unitarias con Vitest (GameTracker)

Archivo de pruebas: `game-project/src/Experience/__tests__/GameTracker.test.js`

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
    expect(bestTimes).toEqual([10,15,20]);
    tracker.saveTime(5);
    tracker.saveTime(8);
    tracker.saveTime(12);
    bestTimes = tracker.getBestTimes();
    expect(bestTimes.length).toBeLessThanOrEqual(5);
    expect(bestTimes[0]).toBe(5);
  });

  it('showEndGameModal() invoca modal.show con mensaje correcto', () => {
    localStorage.setItem('bestTimes', JSON.stringify([7,12,9]));
    tracker.showEndGameModal(12);
    expect(fakeModal.show).toHaveBeenCalled();
    const arg = fakeModal.show.mock.calls[0][0];
    expect(arg.message).toContain('12s');
    expect(arg.message).toContain('#1:');
  });
});
```

---

## Pruebas de Integración (Postman)

Endpoints probados:

- **GET** `/api/blocks/ping` → `http://localhost:3001/api/blocks/ping`  
- **GET** `/api/blocks`  
- **POST** `/api/blocks`  
  ```json
  { "name": "block_test_1", "x":10, "y":20, "z":30 }
  ```  
- **POST** `/api/blocks/batch`  
  ```json
  [
    { "name":"block1","x":1,"y":1,"z":1 },
    { "name":"block2","x":2,"y":2,"z":2 },
    { "name":"block3","x":3,"y":3,"z":3 }
  ]
  ```

_Evidencia:_ Se exportó la colección Postman y se capturaron capturas de cada solicitud/respuesta.

---

## Pruebas de Sistema (JMeter)

- **Thread Group:** 5 usuarios, 10 s ramp-up, 10 iteraciones.  
- **HTTP Request Defaults:** protocolo `http`, servidor `localhost`, puerto `3001`.  
- **Header Manager:** `Content-Type: application/json`, `Accept: application/json`.  
- **Samplers:** GET `/ping`, GET `/blocks`, POST `/blocks`, POST `/blocks/batch`.  
- **Listeners:** View Results Tree, Aggregate Report, Summary Report (objetivo: tiempos < 5 s).  
- Capturas de la configuración y resultados se incluyen como evidencia.

---

## Automatización CI/CD con Jenkins

### Jenkinsfile y Solución de Errores

```groovy
pipeline {
  agent any
  environment {
    CI = "false"
    VERCEL_TOKEN = credentials('vercel-token')
  }
  tools { nodejs 'Node 20' }
  stages {
    stage('Clean workspace') { steps { deleteDir() } }
    stage('Checkout') {
      steps {
        git url: 'https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git',
            branch: 'main',
            credentialsId: 'github-token'
      }
    }
    stage('Install dependencies') {
      steps { dir('game-project') { bat 'npm install --legacy-peer-deps' } }
    }
    stage('Run Unit Tests') {
      steps { dir('game-project') { bat 'npx vitest run src/Experience/__tests__/GameTracker.test.js' } }
    }
    stage('Build app') {
      steps { dir('game-project') { bat 'npm run build' } }
    }
    stage('Deploy to Vercel') {
      steps { dir('game-project') { bat 'npx vercel --prod --yes --token %VERCEL_TOKEN%' } }
    }
  }
}
```

**Errores comunes y soluciones:**  
- **ENOENT**: usar `dir('game-project')` para ubicar `package.json`.  
- **Confirmación Vercel**: flag `--yes`.  
- **Credenciales**: usar Jenkins Credentials para GitHub y Vercel.

---

## Exposición de Jenkins con Ngrok y Configuración del Webhook en GitHub

1. **Ngrok:**  
   ```powershell
   & "C:\ProgramData\chocolatey\lib\ngrok\tools\ngrok.exe" http 8080
   ```
   - URL pública, ej. `https://abcd1234.ngrok-free.app`  
2. **GitHub Webhook:**  
   - Payload URL: `https://abcd1234.ngrok-free.app/github-webhook/`  
   - Content type: `application/json`  
   - Eventos: “Just the push event”  
3. **Verificación:** Push al repositorio y revisar que Jenkins dispare el pipeline automáticamente.

---

## Despliegue en Vercel

- Importar repositorio o carpeta `game-project`.  
- Vercel detecta React/Vite y configura `vite build` → `dist`.  
- Variables de entorno:  
  ```bash
  VITE_API_URL=http://localhost:3001
  ```
- Cada push actualiza el despliegue.  
- URL pública, ej. `https://game-project-xyz.vercel.app`.

---

## Instrucciones de Uso

1. **Clonar repositorio:**  
   ```bash
   git clone https://github.com/CamiloToroUCC/ProtectoFinalGameProyect.git
   ```
2. **Backend:**  
   ```bash
   cd ProtectoFinalGameProyect/backend
   npm install
   npm start
   ```
3. **Frontend:**  
   ```bash
   cd ../game-project
   npm install
   npm run dev
   ```
4. **Pruebas Unitarias:**  
   ```bash
   npm run test
   ```
5. **Pipeline CI/CD:**  
   Cada push dispara el pipeline en Jenkins. Para Webhook y Ngrok, ejecutar Ngrok y asegurar la Payload URL.

---

## Referencias

- Guía de Pruebas Unitarias con Vitest: https://asigcalidadsoftware.vercel.app/modules/semana6.html  
- Guía de Integración Continua con Jenkins y Postman: https://asigcalidadsoftware.vercel.app/modules/postman.html  

---

## Conclusiones y Consideraciones

- **Calidad y Estructura:** separación clara entre backend y frontend.  
- **Pruebas:** unitarias, integración y sistema validadas.  
- **CI/CD:** pipeline que automatiza pruebas, build y despliegue, solucionando errores comunes.  
- **Exposición Remota:** Ngrok + Webhooks para integración GitHub–Jenkins.  
- **Despliegue:** Vercel auto-deploy en cada push.  
- **Documentación:** README detallado que refleja el proceso seguido y los resultados obtenidos.
