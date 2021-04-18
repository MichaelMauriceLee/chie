import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mount } from '@cypress/react';
import Info from './Info';

describe('Info', () => {
  it('renders', () => {
    mount(<Info />);
    cy.contains('Welcome');
  });
});
