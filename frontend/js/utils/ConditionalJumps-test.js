// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConditionalJumps } from './ConditionalJumps';

describe('<ConditionalJumps />', () => {
  const props = {
    jumps: [
      {
        id: 'jump1',
        always: true,
        conditions: [
          { value: { id: '15', title: 'First question', number: 15 } },
          { value: { id: '16', title: 'Second question', number: 16 } },
        ],
        destination: { id: 'destination1', number: 6, title: 'other question' },
      },
      { id: 'jump2', always: true, conditions: [], destination: {} },
      {
        id: 'jump3',
        always: true,
        conditions: [
          { value: { id: '17', title: 'Question 6' } },
          { value: { id: '18', title: 'Question 7' } },
          { value: { id: '19', title: 'Question 8' } },
        ],
        destination: { number: 23, title: 'other question' },
      },
      {
        id: 'jump4',
        always: true,
        conditions: [{ value: { id: '20', title: 'Question 9' } }],
        destination: { number: 2, title: 'other question' },
      },
    ],
  };

  const emptyJumps = {
    jumps: [],
  };

  it('should render correctly', () => {
    // $FlowFixMe please fix this
    const wrapper = shallow(<ConditionalJumps {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null', () => {
    const wrapper = shallow(<ConditionalJumps {...emptyJumps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
