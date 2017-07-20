/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { OpinionBox } from './OpinionBox';

describe('<OpinionBox />', () => {
  const props = {
    opinion: {
      title: 'title',
      answer: {},
      type: { title: 'opinionType', color: 'info' },
    },
    rankingThreshold: 0,
    opinionTerm: 0,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<OpinionBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
