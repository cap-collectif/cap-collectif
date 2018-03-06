// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SectionRecursiveList } from './SectionRecursiveList';

describe('<SectionRecursiveList />', () => {
  const props = {
    // $FlowFixMe $refType
    sections: [{ sections: [] }, { sections: [] }],
    consultation: {},
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionRecursiveList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
