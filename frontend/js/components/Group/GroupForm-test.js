// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupForm } from './GroupForm';

describe('<GroupForm />', () => {
  it('render correctly', () => {
    const wrapper = shallow(<GroupForm />);
    expect(wrapper).toMatchSnapshot();
  });
});
