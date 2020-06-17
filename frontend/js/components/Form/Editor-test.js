/* eslint-env jest */
/* @flow */
import React from 'react';
import { render } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl-redux';
import { Editor } from './Editor';
import appStore from '../../stores/AppStore';
import { intlMock } from '../../mocks';

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
      // $FlowFixMe
      <Provider store={appStore({})}>
        <IntlProvider>
          <Editor {...defaultProps} />
        </IntlProvider>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
