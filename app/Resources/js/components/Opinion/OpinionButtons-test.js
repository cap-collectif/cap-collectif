// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../mocks';
import { OpinionButtons } from './OpinionButtons';

describe('<OpinionButtons />', () => {
  const props = {
    opinion: {
      __typename: 'Opinion',
      $refType,
      $fragmentRefs,
      title: 'title',
      url: 'www.test.com',
      section: { url: '#' },
      project: { opinionCanBeFollowed: true },
      author: { slug: 'userAdmin' },
    },
    rankingThreshold: 0,
    opinionTerm: 0,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<OpinionButtons {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
