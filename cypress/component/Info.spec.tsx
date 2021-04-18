import React from 'react';
import { mount } from '@cypress/react';
import Info from '../../components/Info';

describe('Info', () => {
  it('renders', () => {
    mount(
      <Info />,
    );
    // Assert
    cy.contains('Welcome');
  });
});
