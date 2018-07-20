// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../mocks';
import { OpinionBox } from './OpinionBox';

describe('<OpinionBox />', () => {
  const props = {
    opinion: {
      __typename: 'Opinion',
      $refType,
      $fragmentRefs,
      title: 'title',
      section: { title: 'sectionTitle', url: '#', color: 'info' },
    },
    rankingThreshold: 0,
    opinionTerm: 0,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<OpinionBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
