import {collectDefaultMetrics, Metric, Registry} from "prom-client";
import gcStats from "prometheus-gc-stats";
import {RegistryMetricCreator} from "./utils/registryMetricCreator.js";

export type IMetrics = {register: RegistryMetricCreator};

export function createMetrics(
  externalRegistries: Registry[] = []
): IMetrics {
  const register = new RegistryMetricCreator();
  collectNodeJSMetrics(register);

  // Merge external registries
  for (const externalRegister of externalRegistries) {
    for (const metric of externalRegister.getMetricsAsArray()) {
      register.registerMetric((metric as unknown) as Metric<string>);
    }
  }

  return {
    register
  };
}

export function collectNodeJSMetrics(register: Registry): void {
  collectDefaultMetrics({
    register,
    // eventLoopMonitoringPrecision with sampling rate in milliseconds
    eventLoopMonitoringPrecision: 10,
  });

  // Collects GC metrics using a native binding module
  // - nodejs_gc_runs_total: Counts the number of time GC is invoked
  // - nodejs_gc_pause_seconds_total: Time spent in GC in seconds
  // - nodejs_gc_reclaimed_bytes_total: The number of bytes GC has freed
  gcStats(register)();
}
