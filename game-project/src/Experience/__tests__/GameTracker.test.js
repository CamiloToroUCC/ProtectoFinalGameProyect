// src/Experience/__tests__/GameTracker.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import GameTracker from '../Utils/GameTracker';

// Creamos mocks para simular las dependencias "modal" y "menu"
const fakeModal = {
  show: vi.fn(),
  hide: vi.fn()
};

const fakeMenu = {
  setTimer: vi.fn()
};

beforeEach(() => {
  // Limpiar localStorage antes de cada prueba para evitar interferencias
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Pruebas unitarias para GameTracker', () => {
  let tracker;
  beforeEach(() => {
    tracker = new GameTracker({ modal: fakeModal, menu: fakeMenu });
  });

  it('debe inicializar con startTime en null y finished en false', () => {
    expect(tracker.startTime).toBeNull();
    expect(tracker.finished).toBe(false);
  });

  it('start() debería asignar un valor a startTime y llamar a menu.setTimer', (done) => {
    tracker.start();
    // Esperamos 1.1 segundos para permitir que el loop actualice el contador
    setTimeout(() => {
      // Se espera que startTime se haya establecido
      expect(tracker.startTime).not.toBeNull();
      // Se espera que menu.setTimer haya sido llamado al menos una vez
      expect(fakeMenu.setTimer).toHaveBeenCalled();
      // Finalizamos la ejecución del loop para evitar llamadas infinitas
      tracker.finished = true;
      done();
    }, 1100);
  });

  it('stop() debe marcar finished como true y retornar el tiempo transcurrido', (done) => {
    tracker.start();
    setTimeout(() => {
      const elapsed = tracker.stop();
      expect(tracker.finished).toBe(true);
      expect(elapsed).toBeGreaterThanOrEqual(1);
      done();
    }, 1100);
  });

  it('getElapsedSeconds() debe calcular el tiempo transcurrido correctamente', (done) => {
    tracker.start();
    setTimeout(() => {
      const elapsed = tracker.getElapsedSeconds();
      expect(elapsed).toBeGreaterThanOrEqual(1);
      tracker.finished = true;
      done();
    }, 1100);
  });

  it('saveTime() debe almacenar y ordenar los tiempos correctamente', () => {
    tracker.saveTime(15);
    tracker.saveTime(10);
    tracker.saveTime(20);
    let bestTimes = tracker.getBestTimes();
    expect(bestTimes).toEqual([10, 15, 20]);

    // Guardamos más tiempos para verificar que se guardan sólo los 5 mejores
    tracker.saveTime(5);
    tracker.saveTime(8);
    tracker.saveTime(12);
    bestTimes = tracker.getBestTimes();
    expect(bestTimes.length).toBeLessThanOrEqual(5);
    expect(bestTimes[0]).toBe(5);
  });

  it('showEndGameModal() debe llamar a modal.show con un mensaje que incluya el tiempo actual', () => {
    // Preparamos "mejores tiempos" en localStorage
    localStorage.setItem('bestTimes', JSON.stringify([7, 12, 9]));
    tracker.showEndGameModal(12);

    // Se espera que se llame a modal.show
    expect(fakeModal.show).toHaveBeenCalled();
    // Verificamos que el mensaje incluya "12s"
    const callArg = fakeModal.show.mock.calls[0][0];
    expect(callArg.message).toContain('12s');
    // Verificamos también que se muestre algún ranking (ejemplo "#1:")
    expect(callArg.message).toContain('#1:');
  });
});
