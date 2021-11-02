import {
  PackageStructure,
  LayersStructure,
  PluginsStructure,
  AggregationStructure,
} from '../interface';

export interface FBFServerlessStructure {
  service: string;
  provider: FBFProviderStructure;
  functions: FBFFunctionsStructure;
  plugins: PluginsStructure;
  package: PackageStructure;
  layers: LayersStructure;
  aggregation: AggregationStructure;
}

export interface FBFProviderStructure {
  name: string;
  runtime: string;
  credentials: string;
  stage?: string;
  cosBucket?: string;
  role?: string;
  memorySize?: number;
  timeout?: number;
  region?: string;
  environment?: EnvironmentSpec;
  vpcConfig?: VpcConfig;
}

export interface FBFFunctionsStructure {
  [key: string]: FBFFunctionStructure;
}

export interface FBFFunctionStructure {
  handler: string;
  description: string;
  runtime: string;
  memorySize: number;
  timeout: number;
  environment?: EnvironmentSpec;
  vpcConfig?: VpcConfig;
  events: Array<{
    [eventName: string]: FBFEventType;
  }>;
}

export interface EnvironmentSpec {
  variables: { [key: string]: string };
}

export type FBFEventType =
  | FBFAPIGatewayEvent
  | FBFCKafkaEvent
  | FBFCMQEvent
  | FBFCOSEvent
  | FBFTimerEvent;

export interface FBFAPIGatewayEvent {
  name: string;
  parameters: {
    stageName?: string;
    serviceId?: string;
    httpMethod?: FBFHTTPMethod;
    integratedResponse?: boolean;
    path: string;
    enableCORS?: boolean;
    serviceTimeout?: number;
  };
}

export interface FBFCKafkaEvent {
  name: string;
  parameters: {
    name: string;
    topic: string;
    maxMsgNum: number;
    offset: string;
    enable: boolean;
  };
}

export interface FBFCMQEvent {
  name: string;
  parameters: {
    name: string;
    enable: boolean;
  };
}

export interface FBFCOSEvent {
  name: string;
  parameters: {
    bucket: string;
    filter: {
      prefix: string;
      suffix: string;
    };
    events: string;
    enable: boolean;
  };
}

export interface FBFTimerEvent {
  name: string;
  parameters: {
    cronExpression: string;
    enable: boolean;
  };
}

export interface VpcConfig {
  vpcId: string;
  subnetId: string;
}

export interface Package {
  include: string[];
  exclude: string[];
}

export type FBFHTTPMethod = 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
