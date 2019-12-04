// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectHeaderAuthorsView } from './ProjectHeaderAuthorsView';

describe('<ProjectHeaderAuthorsView />', () => {
  it('renders correctly', () => {
    const props = {
      projectId: '1',
    };
    const wrapper = shallow(<ProjectHeaderAuthorsView {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
