// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import DropdownSelect from '~ui/DropdownSelect';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

storiesOf('Core|Select/DropdownSelect', module)
  .add('default', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item4">Item 4</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item5">Item 5</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item6">Item 6</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with indeterminate choices', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice isIndeterminate value="item2">
          Item 2
        </DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Choice isIndeterminate value="item4">
          Item 4
        </DropdownSelect.Choice>
        <DropdownSelect.Choice value="item5">Item 5</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item6">Item 6</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with disabled choices', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice disabled value="item1">
          Item 1
        </DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice disabled value="item3">
          Item 3
        </DropdownSelect.Choice>
        <DropdownSelect.Choice disabled value="item4">
          Item 4
        </DropdownSelect.Choice>
        <DropdownSelect.Choice value="item5">Item 5</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item6">Item 6</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with a message on top', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Message icon={<Icon name={ICON_NAME.information} />}>
          <p>Je suis un beau message avertissant que The Promised Neverland est très cool</p>
        </DropdownSelect.Message>
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item4">Item 4</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item5">Item 5</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item6">Item 6</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with multi select', () => {
    return (
      <DropdownSelect
        title="Trier par"
        value={['item1', 'item3', 'item6', 'item3.1', 'item3.3']}
        isMultiSelect>
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Menu name="oui">
          <DropdownSelect.Choice value="item3.1">Item 3.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="item3.2">Item 3.2</DropdownSelect.Choice>
          <DropdownSelect.Choice value="item3.3">Item 3.3</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item4">Item 4</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item5">Item 5</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item6">Item 6</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with submenus on root', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Menu name="Etape 1">
          <DropdownSelect.Choice value="itemÉtape1.1">Item étape 1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.2">Item étape 1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 2">
          <DropdownSelect.Choice value="itemÉtape2.1.1">Item étape 2.1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape2.1.2">Item étape 2.1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 3">
          <DropdownSelect.Choice value="itemÉtape3.1.1">Item étape 3.1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape3.1.2">Item étape 3.1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 4">
          <DropdownSelect.Choice value="itemÉtape4.1.1">Item étape 4.1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape4.1.2">Item étape 4.1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
      </DropdownSelect>
    );
  })
  .add('with submenu', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Menu name="Etape 1">
          <DropdownSelect.Choice value="itemÉtape1.1">Item étape 1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.2">Item étape 1.2</DropdownSelect.Choice>
          <DropdownSelect.Menu name="Etape 1 - 1">
            <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
            <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>
          </DropdownSelect.Menu>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 2">
          <DropdownSelect.Choice value="itemÉtape2.1">Item étape 2.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape2.2">Item étape 2.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with submenu dancing left and right', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Menu name="Étape dansante">
          <DropdownSelect.Choice value="itemÉtape1.1">Item étape 1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.2">Item étape 1.2</DropdownSelect.Choice>
          <DropdownSelect.Menu name="Etape 1 - 1" pointing="left">
            <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
            <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>

            <DropdownSelect.Menu name="Etape 1 - 1" pointing="right">
              <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
              <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>

              <DropdownSelect.Menu name="Etape 1 - 1" pointing="left">
                <DropdownSelect.Choice value="itemÉtape1.1.1">
                  Item étape 1.1.1
                </DropdownSelect.Choice>
                <DropdownSelect.Choice value="itemÉtape1.1.2">
                  Item étape 1.1.2
                </DropdownSelect.Choice>

                <DropdownSelect.Menu name="Etape 1 - 1" pointing="right">
                  <DropdownSelect.Choice value="itemÉtape1.1.1">
                    Item étape 1.1.1
                  </DropdownSelect.Choice>
                  <DropdownSelect.Choice value="itemÉtape1.1.2">
                    Item étape 1.1.2
                  </DropdownSelect.Choice>
                </DropdownSelect.Menu>
              </DropdownSelect.Menu>
            </DropdownSelect.Menu>
          </DropdownSelect.Menu>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>
    );
  });
