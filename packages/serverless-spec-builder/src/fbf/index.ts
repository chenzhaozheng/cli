import { generate, transform } from '../index';
import { FBFServerlessSpecBuilder } from './builder';

export const generateFunctionsSpec = (filePath: any) => {
  return transform(filePath, FBFServerlessSpecBuilder);
};

export const generateFunctionsSpecFile = (
  sourceFilePathOrJson: any,
  targetFilePath = '.serverless/serverless.yml'
) => {
  generate(sourceFilePathOrJson, targetFilePath, FBFServerlessSpecBuilder);
};
