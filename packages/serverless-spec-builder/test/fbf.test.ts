import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { generateFunctionsSpec, generateFunctionsSpecFile } from '../src/fbf';
import { convertMethods } from '../src/fbf/builder';
import { FBFServerlessStructure } from '../src/fbf/interface';

describe('/test/fbf.test.ts', () => {
  describe('generate', () => {
    const root = path.resolve(__dirname, 'fixtures/fbf');

    it('test transform yml', () => {
      const result: FBFServerlessStructure = generateFunctionsSpec(
        path.join(root, 'serverless.yml')
      );
      assert(result.functions);
      assert(Array.isArray(result.plugins));
    });

    it('test generate spce file', () => {
      generateFunctionsSpecFile(path.join(root, 'serverless.yml'));
      assert(fs.existsSync(path.join(root, '.serverless/serverless.yml')));
      fs.unlinkSync(path.join(root, '.serverless/serverless.yml'));
      fs.rmdirSync(path.join(root, '.serverless'));
    });
  });

  it('convertMethods', () => {
    assert(convertMethods('get') === 'GET');
    assert(convertMethods('xxxx') === 'ANY');
    assert(convertMethods(['post', 'xxx', 'head']) === 'POST');
  });
});
