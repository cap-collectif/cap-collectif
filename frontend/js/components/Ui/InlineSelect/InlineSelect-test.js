/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import InlineSelect from '~ui/InlineSelect';

describe('<InlineSelect />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <InlineSelect>
        <InlineSelect.Choice value="item1">Item 1</InlineSelect.Choice>
        <InlineSelect.Choice value="item2">Item 2</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 3</InlineSelect.Choice>
      </InlineSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
