// eslint-disable-next-line import/no-extraneous-dependencies
import injectDevServer from '@cypress/react/plugins/next';

export default (on, config) => {
  injectDevServer(on, config);
  return config;
};
