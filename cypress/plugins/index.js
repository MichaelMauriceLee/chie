import injectDevServer from '@cypress/react/plugins/next';

export default (on, config) => {
  injectDevServer(on, config);
  return config;
};
