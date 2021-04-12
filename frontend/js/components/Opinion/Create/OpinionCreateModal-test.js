// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionCreateModal } from './OpinionCreateModal';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<OpinionCreateModal />', () => {
  const defaultProps = {
    show: true,
    consultation: {
      $refType,
      $fragmentRefs,
      step: {
        $fragmentRefs,
      },
    },
    section: { $refType, $fragmentRefs, id: 'opinionTypeId' },
    submitting: true,
    dispatch: jest.fn(),
    invalidRequirements: false,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionCreateModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when requirements not meet', () => {
    const props = {
      ...defaultProps,
      invalidRequirements: true,
    };
    const wrapper = shallow(<OpinionCreateModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
