/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RankingBlock from './RankingBlock';

const field = {
  id: 42,
  choices: [{}, {}, {}],
};

const props = {
  connectDropTarget: c => c,
  onRankingChange: () => {},
  field,
};

const state = {
  items: {
    pickBox: [{}, {}],
    choiceBox: [{}],
  },
};

const OriginalComponent = RankingBlock.DecoratedComponent;

describe('<RankingBlock />', () => {
  it('should render two ranking boxes with correct props', () => {
    const wrapper = shallow(<OriginalComponent {...props} />);
    expect(wrapper).toMatchSnapshot();
    wrapper.setState(state);
    expect(wrapper).toMatchSnapshot();
  });
});
