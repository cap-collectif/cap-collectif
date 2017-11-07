// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupCreateButton } from './GroupCreateButton';

describe('<GroupCreateButton />', () => {
  const props = { submit: () => {}, submitting: false };

  it('render correctly', () => {
    const wrapper = shallow(<GroupCreateButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
