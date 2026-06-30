export interface ApiError {
  timestamp: string;
  status: number;
  error?: string;
  code?: string;
  message: string;
  path: string;
  traceId?: string;
}
