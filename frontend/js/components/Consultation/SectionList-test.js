// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SectionList } from './SectionList';
import { $fragmentRefs } from '../../mocks';

describe('<SectionList />', () => {
  const props = {
    section: {
      __id: 'section1',
      sections: [{ __id: 'section2', sections: [], $fragmentRefs }],
      $fragmentRefs,
    },
    consultation: {},
    level: 0,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
