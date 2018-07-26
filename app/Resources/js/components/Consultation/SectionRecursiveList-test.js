// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SectionRecursiveList } from './SectionRecursiveList';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<SectionRecursiveList />', () => {
  const props = {
    consultation: {
      $refType,
      $fragmentRefs,
      sections: [{ sections: [], $fragmentRefs }, { sections: [], $fragmentRefs }],
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionRecursiveList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
