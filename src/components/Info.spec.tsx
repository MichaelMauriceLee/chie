import React from 'react';
import { mount } from '@cypress/react';
import { Default } from './Info.stories';

describe('Info', () => {
  it('renders', () => {
    mount(<Default />);
    cy.contains('Welcome');
  });
});
