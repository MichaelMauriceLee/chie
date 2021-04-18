import React from 'react';
import { render } from '@testing-library/react';

import Info from './Info';

describe('Info component', () => {
  it('should render component', () => {
    const { getByText } = render(<Info />);
    const welcomeElement = getByText('Welcome');

    expect(welcomeElement).toBeInTheDocument();
  });
});
