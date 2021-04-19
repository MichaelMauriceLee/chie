import React from 'react';
import { Story, Meta } from '@storybook/react';
import Info from './Info';

export default {
  title: 'Info',
  component: Info,
} as Meta;

const Template: Story = () => <Info />;

export const Default = Template.bind({});
