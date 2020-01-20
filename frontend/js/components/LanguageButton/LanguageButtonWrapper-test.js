// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { LanguageButtonWrapper } from './LanguageButtonWrapper';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<LanguageButtonWrapper />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    languages: [{ $refType, $fragmentRefs }],
  };

  it('should render correctly', () => {
    const wrapper = shallow(<LanguageButtonWrapper {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
