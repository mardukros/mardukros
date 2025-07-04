import { AutonomyScheduler } from '../scheduler.js';

jest.useFakeTimers();

describe('AutonomyScheduler', () => {
  let scheduler: AutonomyScheduler;

  beforeEach(() => {
    scheduler = new AutonomyScheduler();
  });

  afterEach(() => {
    scheduler.stop();
    jest.clearAllTimers();
  });

  it('should start and stop scheduler', () => {
    scheduler.start();
    expect(setInterval).toHaveBeenCalled();

    scheduler.stop();
    expect(scheduler['isRunning']).toBe(false);
  });

  it('should not start multiple instances', () => {
    scheduler.start();
    const firstInterval = setInterval;
    
    scheduler.start();
    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it('should run optimization check at intervals', () => {
    scheduler.start();
    jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour
    
    // Verify optimization was attempted
    expect(scheduler['coordinator'].shouldRewrite).toHaveBeenCalled();
  });
});