// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionEditModal } from './OpinionEditModal';
import { intlMock, $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionEditModal />', () => {
  const props = {
    intl: intlMock,
    show: true,
    opinion: { id: 'opinion1', $refType, $fragmentRefs },
    submitting: false,
    dispatch: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
