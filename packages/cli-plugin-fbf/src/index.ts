import { BasePlugin, ICoreInstance } from '@midwayjs/command-core';
import { join } from 'path';
import {
  generateComponentSpec,
  generateFunctionsSpecFile,
} from '@midwayjs/serverless-spec-builder/fc';

export default class FirebaseFBFPlugin extends BasePlugin {
  core: ICoreInstance;
  options: any;
  provider = 'firebase';
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');

  hooks = {
    'package:generateSpec': async () => {
      this.core.cli.log('Generate spec file...');
      await generateFunctionsSpecFile(
        this.getSpecJson({
          provider: {
            stage: 'test',
          },
        }),
        join(this.midwayBuildPath, 'serverless.yml')
      );
    },
    'package:generateEntry': async () => {},
    'deploy:deploy': async () => {
      this.core.cli.log('Start deploy by @firebase-cli');
      try {
        if (!this.options.skipDeploy) {
          // await FirebaseDeply({
          //   template: join(this.midwayBuildPath, 'firebase.json'),
          //   assumeYes: this.options.yes,
          // })
        }
        this.core.cli.log('Deploy success');
      } catch (e) {
        this.core.cli.log(`Deploy error: ${e.message}`);
      }
    },
  };

  getSpecJson(coverOptions?: any) {
    const service = this.core.service;
    if (coverOptions) {
      Object.keys(coverOptions).forEach((key: string) => {
        Object.assign(service[key], coverOptions[key]);
      });
    }
    return {
      custom: service.custom,
      service: service.service,
      provider: service.provider,
      functions: this.core.service.functions,
      resoures: service.resources,
      package: service.package,
    };
  }

  async getFirebaseServerless() {
    const cwd = process.cwd();
    const functions = generateComponentSpec(this.core.service);
    try {
      for (const fcDeployInputs in functions) {
        Object.assign(fcDeployInputs, this.options.serverlessDev);
      }
      // test
    } catch (e) {
      this.core.cli.log(`Deploy error：${e.message}`);
    }
    process.chdir(cwd);
  }
}
