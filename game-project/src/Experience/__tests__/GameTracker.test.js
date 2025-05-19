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
  // Limpiar localStorage y resetear mocks antes de cada prueba
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Pruebas unitarias para GameTracker', () => {
  let tracker;

  beforeEach(() => {
    // Creamos una nueva instancia de GameTracker antes de cada prueba
    tracker = new GameTracker({ modal: fakeModal, menu: fakeMenu });
  });

  it('debe inicializar con startTime en null y finished en false', () => {
    expect(tracker.startTime).toBeNull();
    expect(tracker.finished).toBe(false);
  });

  it('start() debería asignar un valor a startTime y llamar a menu.setTimer', (done) => {
    tracker.start();
    // Esperamos 1.1 segundos para que el loop de actualización tenga tiempo de ejecutarse
    setTimeout(() => {
      // startTime debe haber sido asignado
      expect(tracker.startTime).not.toBeNull();
      // Se espera que menu.setTimer se haya invocado por lo menos una vez
      expect(fakeMenu.setTimer).toHaveBeenCalled();
      // Finalizamos el loop para evitar llamadas continuas 
      tracker.finished = true;
      done();
    }, 1100);
  });

  it('stop() debe marcar finished como true y retornar el tiempo transcurrido mayor o igual a 1 segundo', (done) => {
    tracker.start();
    setTimeout(() => {
      const elapsed = tracker.stop();
      expect(tracker.finished).toBe(true);
      expect(elapsed).toBeGreaterThanOrEqual(1);
      done();
    }, 1100);
  });

  it('getElapsedSeconds() debe calcular el tiempo correctamente mientras la partida está en curso', (done) => {
    tracker.start();
    setTimeout(() => {
      const elapsed = tracker.getElapsedSeconds();
      expect(elapsed).toBeGreaterThanOrEqual(1);
      // Finalizamos la prueba
      tracker.finished = true;
      done();
    }, 1100);
  });

  it('saveTime() y getBestTimes() deben almacenar y ordenar correctamente los tiempos', () => {
    // Guardamos tiempos desordenados
    tracker.saveTime(15);
    tracker.saveTime(10);
    tracker.saveTime(20);
    let bestTimes = tracker.getBestTimes();
    // Se espera que queden ordenados de menor a mayor
    expect(bestTimes).toEqual([10, 15, 20]);

    // Agregamos más tiempos para comprobar que se limita a los 5 mejores tiempos
    tracker.saveTime(5);
    tracker.saveTime(8);
    tracker.saveTime(12);
    bestTimes = tracker.getBestTimes();
    // La longitud nunca debe superar 5 registros
    expect(bestTimes.length).toBeLessThanOrEqual(5);
    // El menor tiempo debe ser 5
    expect(bestTimes[0]).toBe(5);
  });

  it('showEndGameModal() debe llamar a modal.show con un mensaje que incluya el tiempo actual y un ranking', () => {
    // Preparamos un conjunto de “mejores tiempos” en localStorage
    localStorage.setItem('bestTimes', JSON.stringify([7, 12, 9]));
    tracker.showEndGameModal(12);

    // Se espera que modal.show se invoque
    expect(fakeModal.show).toHaveBeenCalled();
    // Obtenemos el argumento con el que se llamó a modal.show
    const callArg = fakeModal.show.mock.calls[0][0];
    // Verificamos que el mensaje incluya el tiempo "12s"
    expect(callArg.message).toContain('12s');
    // Verificamos la presencia de indicación de ranking, ej., "#1: "
    expect(callArg.message).toContain('#1:');
  });
});
