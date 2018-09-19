// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDetailLikers } from './ProposalDetailLikers';
import { $refType, $fragmentRefs, intlMock } from '../../../mocks';

describe('<ProposalDetailLikers />', () => {
  const propsWithLikers = {
    showModal: true,
    dispatch: jest.fn(),
    intl: intlMock,
    proposal: {
      $refType,
      $fragmentRefs,
      id: '1',
      likers: [
        {
          id: '1',
        },
        {
          id: '2',
        },
      ],
    },
  };

  const propsWithoutLikers = {
    showModal: false,
    dispatch: jest.fn(),
    intl: intlMock,
    proposal: {
      $refType,
      $fragmentRefs,
      id: '1',
      likers: [],
    },
  };

  it('should not render anything when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikers {...propsWithoutLikers} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a <Modal /> when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers {...propsWithLikers} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a div when specified', () => {
    const wrapper = shallow(<ProposalDetailLikers componentClass="div" {...propsWithLikers} />);
    expect(wrapper).toMatchSnapshot();
  });
});
