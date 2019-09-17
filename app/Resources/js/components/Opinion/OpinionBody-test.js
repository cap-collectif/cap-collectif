// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../mocks';
import { OpinionBody } from './OpinionBody';

describe('<OpinionBody />', () => {
  const props = {
    opinion: {
      __typename: 'Version',
      $refType,
      $fragmentRefs,
      comment: 'comment',
    },
  };

  it('should render correctly when the opinion is a version', () => {
    const wrapper = shallow(<OpinionBody {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
