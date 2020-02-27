/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import DropdownSelect from '~ui/DropdownSelect';

describe('<DropdownSelect />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a submenu', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Menu name="Submenu 1">
          <DropdownSelect.Choice value="submenuItem1">Submenu 1 item 1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="submenuItem2">Submenu 1 item 2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item3">Item 4</DropdownSelect.Choice>
      </DropdownSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with submenu in a submenu', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Menu name="Submenu 1">
          <DropdownSelect.Choice value="submenuItem1">Submenu 1 item 1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="submenuItem2">Submenu 1 item 2</DropdownSelect.Choice>
          <DropdownSelect.Menu name="Submenu 2">
            <DropdownSelect.Choice value="submenuItem2-1">Submenu 2 item 1</DropdownSelect.Choice>
            <DropdownSelect.Choice value="submenuItem2-2">Submenu 2 item 2</DropdownSelect.Choice>
          </DropdownSelect.Menu>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item3">Item 4</DropdownSelect.Choice>
      </DropdownSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
