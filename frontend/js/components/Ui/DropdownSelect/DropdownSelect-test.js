/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import DropdownSelect from '~ui/DropdownSelect';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

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

  it('should render correctly with indeterminate choices', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice isIndeterminate value="item1">
          Item 1
        </DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice isIndeterminate value="item3">
          Item 3
        </DropdownSelect.Choice>
      </DropdownSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with disabled choices', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice disabled value="item1">
          Item 1
        </DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice disabled value="item3">
          Item 3
        </DropdownSelect.Choice>
      </DropdownSelect>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a message', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Message>
          <p>Je suis un beau message</p>
        </DropdownSelect.Message>
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a message that has an icon', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par">
        <DropdownSelect.Message icon={<Icon name={ICON_NAME.information} />}>
          <p>
            Je suis un beau message avec une icône qui vous informe que The Promised Neverland est
            très cool
          </p>
        </DropdownSelect.Message>
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with multi-select enabled', () => {
    const wrapper = shallow(
      <DropdownSelect title="Trier par" isMultiSelect>
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
