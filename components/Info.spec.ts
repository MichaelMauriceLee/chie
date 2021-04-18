import { mount } from '@cypress/react';
import Info from './Info';

it('renders', () => {
  mount(<Info />);
  cy.contains('Welcome');
});
