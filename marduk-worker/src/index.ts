import { logger } from 'marduk-ts/core/logging/logger.ts';

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      logger.info(
        `Scheduled task started at ${new Date().toISOString()} with cron pattern: ${event.cron}`,
      );

      const startTime = Date.now();
      let resp = await fetch("https://api.cloudflare.com/client/v4/ips");
      let wasSuccessful = resp.ok ? "success" : "fail";
      const duration = Date.now() - startTime;

      logger.info(
        `Task execution completed: ${wasSuccessful} (took ${duration}ms)`,
      );

      if (!resp.ok) {
        logger.error(
          `API request failed with status: ${resp.status} ${resp.statusText}`,
        );
        const errorBody = await resp.text();
        logger.error(`Error details: ${errorBody}`);
      }

      ctx.waitUntil(
        this.logTaskCompletion(event.cron, wasSuccessful, duration, env),
      );
    } catch (error) {
      logger.error(`Error in scheduled task: ${error.message}`, error);

      ctx.waitUntil(this.reportError(event.cron, error, env));
    }
  },

  async logTaskCompletion(
    cronPattern: string,
    status: string,
    duration: number,
    env: Env
  ): Promise<void> {
    logger.info(
      `Task execution for pattern ${cronPattern} completed with status ${status} in ${duration}ms`,
    );

    // Example of how you might extend this to store metrics:
    // await env.TASK_METRICS.put(`task_${Date.now()}`, JSON.stringify({
    //   cronPattern,
    //   status,
    //   duration,
    //   timestamp: new Date().toISOString()
    // }));
  },

  async reportError(cronPattern: string, error: Error, env: Env): Promise<void> {
    logger.error(
      `Error in scheduled task with pattern ${cronPattern}: ${error.message}`,
      error
    );

    // Example of how you might extend this to notify about errors:
    // await fetch('https://your-notification-endpoint.com/alert', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     service: 'scheduled-worker',
    //     cronPattern,
    //     error: error.message,
    //     stack: error.stack,
    //     timestamp: new Date().toISOString()
    //   })
    // });
  },
} satisfies ExportedHandler<Env>;
