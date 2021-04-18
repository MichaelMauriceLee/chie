import React from 'react';
import { mount } from '@cypress/react';
import Info from './Info';

describe('Info', () => {
  it('renders', () => {
    mount(<Info />);
    cy.contains('Welcome');
  });
});
