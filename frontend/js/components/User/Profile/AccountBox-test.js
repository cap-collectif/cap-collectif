// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AccountBox } from './AccountBox';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<AccountBox />', () => {
  const props = {
    viewer: {
      $refType,
      $fragmentRefs,
      locale: 'fr-FR',
    },
    languageList: [{ translationKey: 'french', code: 'fr-FR' }, { translationKey: 'english', code: 'en-GB' }],
    dispatch: jest.fn(),
  };

  it('should render a disabled button when the form is invalid', () => {
    const wrapper = shallow(<AccountBox invalid {...props} submitting={false} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render and enabled button when the form is valid', () => {
    const wrapper = shallow(<AccountBox invalid={false} {...props} submitting={false} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a disabled button when the form is submitting', () => {
    const wrapper = shallow(<AccountBox invalid={false} {...props} submitting />);
    expect(wrapper).toMatchSnapshot();
  });
});
