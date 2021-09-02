/* eslint-env jest */
/* @flow */
import React from 'react';
import { render } from 'enzyme';
import { ThemeProvider } from 'styled-components';
import { Editor } from './Editor';
import { intlMock } from '../../mocks';
import { theme } from '~/styles/theme';

describe('<Editor />', () => {
  const defaultProps = {
    intl: intlMock,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    className: 'test',
    value: 'test',
    id: 'azerty',
    disabled: true,
    currentLanguage: 'FR-fr',
  };

  it('should render correctly with defaultProps', () => {
    const wrapper = render(
      <ThemeProvider theme={theme}>
        <Editor {...defaultProps} />
      </ThemeProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
