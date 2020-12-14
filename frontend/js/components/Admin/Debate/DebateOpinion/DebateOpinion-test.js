/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { DebateOpinion } from './DebateOpinion';
import { $fragmentRefs, $refType } from '~/mocks';

const baseProps = {
  debateOpinion: {
    $refType,
    type: 'FOR',
    title: 'Thats my opinion',
    body: 'Thats it',
    author: {
      username: 'Emmanuel Macron',
      $fragmentRefs,
    },
  },
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

const props = {
  basic: baseProps,
};

describe('<DebateOpinion />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DebateOpinion {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
