// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionCreateModal } from './OpinionCreateModal';
import { intlMock, $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionCreateModal />', () => {
  const props = {
    intl: intlMock,
    show: true,
    consultation: { $refType, $fragmentRefs },
    section: { $refType, $fragmentRefs, id: 'opinionTypeId' },
    submitting: true,
    dispatch: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionCreateModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
