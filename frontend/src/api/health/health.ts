import request from '../axios.config';
import type { HealthResponse } from './health.types';

export async function getHealth(): Promise<HealthResponse> {
  return await request.get<HealthResponse>('/api/health/');
}

export * from './health.types';
