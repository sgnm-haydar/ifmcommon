import { OpenTelemetryModule } from 'nestjs-otel';

/**
 * OpenTelemetryOptions
 */
export const OpenTelemetryModuleConfig = OpenTelemetryModule.forRoot({
  metrics: {
    hostMetrics: true,
    apiMetrics: {
      enable: true,
    },
  },
});
