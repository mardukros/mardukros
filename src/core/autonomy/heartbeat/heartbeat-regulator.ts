import { HeartbeatMonitor } from "./heartbeat-monitor.js";
import { AutonomyCoordinator } from "../coordinator.js";
import { logger } from "../../utils/logger.js";
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

export class HeartbeatRegulator {
  private monitor: HeartbeatMonitor;
  private heartbeatInterval: NodeJS.Timer | null = null;
  private readonly HEARTBEAT_INTERVAL = 1000; // 1 second

  constructor(private coordinator: AutonomyCoordinator) {
    this.monitor = new HeartbeatMonitor();
    this.setupMonitoring();
  }

  start(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      this.monitor.beat();
    }, this.HEARTBEAT_INTERVAL);

    logger.info("Heartbeat regulation started");
  }

  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval as unknown as NodeJS.Timeout);
      this.heartbeatInterval = null;
      logger.info("Heartbeat regulation stopped");
    }
  }

  private setupMonitoring(): void {
    this.monitor.on("missed_beat", ({ interval, expected }) => {
      logger.warn("Missed heartbeat", { interval, expected });
      this.adjustAutonomy();
    });

    this.monitor.on("health_check", ({ status, stats }) => {
      if (status !== "healthy") {
        logger.warn("Unhealthy heartbeat detected", { status, stats });
        this.adjustAutonomy();
      }
    });
  }

  private async adjustAutonomy(): Promise<void> {
    try {
      const stats = this.monitor.getStats();

      if (stats.status === "critical") {
        // Pause optimization activities
        this.coordinator.pauseOptimizations();
        logger.info("Paused optimizations due to critical heartbeat");
      } else if (stats.status === "irregular") {
        // Reduce optimization frequency
        this.coordinator.reduceOptimizationFrequency();
        logger.info(
          "Reduced optimization frequency due to irregular heartbeat",
        );
      }

      // Attempt recovery
      await this.coordinator.stabilize();
    } catch (error) {
      logger.error("Error adjusting autonomy:", error as Error);
    }
  }

  getStats() {
    return this.monitor.getStats();
  }
}
