export interface Statistics {
  total_chains: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  recent_executions: ExecutionSummary[];
}

export interface ExecutionSummary {
  execution_id: string;
  chain_id: number;
  chain_name: string;
  status: 'completed' | 'failed' | 'running';
  started_at: string;
  completed_at?: string;
}

export interface ChainConfiguration {
  id: number;
  name: string;
  description?: string;
  steps: ChainStep[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ChainStep {
  module: string;
  operation: string;
  config?: Record<string, any>;
  inputs?: Record<string, any>;
}

export interface ExecutionResult {
  execution_id: string;
  chain_id: number;
  chain_name?: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  input: any;
  output?: any;
  error?: string;
  steps: StepResult[];
  metadata?: Record<string, any>;
}

export interface StepResult {
  step_number: number;
  module: string;
  operation: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  input?: any;
  output?: any;
  error?: string;
}
