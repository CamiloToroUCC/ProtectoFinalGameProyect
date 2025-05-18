import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameTracker from '../Utils/GameTracker'; // Ajusta el path si es necesario

// Crea mocks para las dependencias (por ejemplo, modal y menú)
const mockModal = {
  show: vi.fn(),
  hide: vi.fn()
};

const mockMenu = {
  setTimer: vi.fn()
};

describe('GameTracker', () => {
  let tracker;
  beforeEach(() => {
    localStorage.clear();
    tracker = new GameTracker({ modal: mockModal, menu: mockMenu });
  });

  it('debe inicializarse con startTime null y finished false', () => {
    expect(tracker.startTime).toBeNull();
    expect(tracker.finished).toBe(false);
  });

  it('debe iniciar el timer con start()', () => {
    tracker.start();
    expect(tracker.startTime).not.toBeNull();
  });

  it('debe detener el timer y retornar el tiempo transcurrido', () => {
    tracker.start();
    tracker.startTime = Date.now() - 5000; // Simula 5 segundos transcurridos
    const elapsed = tracker.stop();
    expect(tracker.finished).toBe(true);
    expect(elapsed).toBe(5);
  });

  it('debe guardar y ordenar correctamente los mejores tiempos', () => {
    tracker.saveTime(10);
    tracker.saveTime(5);
    tracker.saveTime(20);
    const best = tracker.getBestTimes();
    expect(best).toEqual([5, 10, 20]);
  });

  it('debe llamar a modal.show al invocar showEndGameModal', () => {
    tracker.showEndGameModal(15);
    expect(mockModal.show).toHaveBeenCalled();
  });
});
