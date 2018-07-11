// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Section } from './Section';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<Section />', () => {
  const props = {
    section: {
      $refType,
      $fragmentRefs,
      contribuable: true,
      contributionsCount: 0,
      slug: 'slug',
      subtitle: 'subtitle',
      title: 'title',
    },
    consultation: {},
    level: 0,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Section {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
