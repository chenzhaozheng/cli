import {
  FunctionsStructure,
  FunctionStructure,
  HTTPEvent,
  MQEvent,
  OSEvent,
  ProviderStructure,
  SpecBuilder,
  TimerEvent,
} from '../index';
// import { FunctionsStructure, ProviderStructure } from '../interface';
import { removeObjectEmptyAttributes } from '../utils';
import {
  FBFAPIGatewayEvent,
  FBFCMQEvent,
  FBFCOSEvent,
  FBFFunctionStructure,
  FBFHTTPMethod,
  FBFServerlessStructure,
  FBFTimerEvent,
} from './interface';

// 组件规格
export class FBFServerlessSpecBuilder extends SpecBuilder {
  toJSON() {
    const providerData: ProviderStructure = this.getProvider();
    const serviceData = this.getService();
    const functionsData: FunctionsStructure = this.getFunctions();
    const serviceName = serviceData.name;

    const serverless: Partial<FBFServerlessStructure> = {
      service: serviceName,
      functions: {},
      plugins: this.getPlugins(),
      provider: {
        name: 'tencent',
        runtime: getNodejsRuntime(providerData.runtime),
        credentials: (providerData as any).credentials,
        // region: providerData.region,
        // stage: providerData.stage,
        // role: providerData.role,
        // memorySize: providerData.memorySize || 128,
        // environment: {
        //   variables: {
        //     ...providerData.environment,
        //     ...userDefinedEnv,
        //   },
        // },
        // timeout: providerData.timeout || 3,
      },
    };

    for (const funName in functionsData) {
      const funSpec = functionsData[funName] as FunctionStructure;

      const functionTemplate: FBFFunctionStructure = {
        handler: funSpec.handler || 'index.main_handler',
        description: funSpec.description || '',
        runtime: funSpec.runtime || serverless.provider.runtime,
        timeout: funSpec.timeout || serverless.provider.timeout,
        memorySize: funSpec.memorySize || serverless.provider.memorySize,
        environment: {
          variables: {
            ...funSpec.environment,
          },
        },
        events: [],
      };

      for (const event of funSpec['events'] ?? []) {
        if (event['http'] || event['apigw']) {
          const evt = (event['http'] || event['apigw']) as HTTPEvent;
          const apiGateway: FBFAPIGatewayEvent = {
            name: `${funName}_apigw_${providerData.stage || 'dev'}`,
            parameters: {
              httpMethod: convertMethods(evt.method),
              path: evt.path,
              serviceTimeout: funSpec.timeout || evt.timeout,
              stageName: funSpec.stage || providerData.stage,
              serviceId: evt.serviceId || providerData.serviceId,
              integratedResponse: evt.integratedResponse || true,
              enableCORS: evt.cors,
            },
          };

          functionTemplate.events.push({
            apigw: apiGateway,
          });
        }

        if (event['timer']) {
          const evt = event['timer'] as TimerEvent;
          const timer: FBFTimerEvent = {
            name: 'timer',
            parameters: {
              cronExpression: evt.value,
              enable: evt.enable === false ? false : true,
            },
          };

          functionTemplate.events.push({
            timer,
          });
        }

        if (event['os'] || event['cos']) {
          const evt = (event['os'] || event['cos']) as OSEvent;
          const cos: FBFCOSEvent = {
            name: evt.name || 'cos',
            parameters: {
              bucket: evt.bucket,
              filter: evt.filter,
              events: evt.events,
              enable: evt.enable === false ? false : true,
            },
          };
          functionTemplate.events.push({ cos });
        }

        if (event['cmq'] || event['mq']) {
          const evt = (event['cmq'] || event['mq']) as MQEvent;
          const cmq: FBFCMQEvent = {
            name: 'cmq',
            parameters: {
              name: evt.topic,
              enable: evt.enable === false ? false : true,
            },
          };
          functionTemplate.events.push({ cmq });
        }

        // if (event['kafka']) {
        //   const ckafka = event['kafka'] as Ckafka;
        //   functionTemplate.events.push({ ckafka });
        // }
      }

      serverless.functions[funName] = functionTemplate;
    }

    return removeObjectEmptyAttributes(serverless);
  }
}

export function convertMethods(method: string | string[]): FBFHTTPMethod {
  // ref: https://cloud.tencent.com/document/product/583/12513
  const currentSupport = ['ANY', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE'];
  if (!method) {
    method = 'any';
  }
  if (Array.isArray(method)) {
    // 腾讯云只支持单个方法类型
    method = method[0];
  }

  if (method.toUpperCase() === 'ALL') {
    method = 'any';
  }

  const upperMethod = method.toUpperCase() as FBFHTTPMethod;
  if (currentSupport.includes(upperMethod)) {
    return upperMethod;
  }
  return 'ANY';
}

export const nodejsVersion = {
  nodejs6: 'Nodejs6.10',
  nodejs8: 'Nodejs8.9',
  nodejs10: 'Nodejs10.15',
  nodejs12: 'Nodejs12.16',
};

function getNodejsRuntime(runtime) {
  if (nodejsVersion[runtime]) {
    return nodejsVersion[runtime];
  }
  if (runtime) {
    return runtime;
  }
  return 'Nodejs12.16';
}
