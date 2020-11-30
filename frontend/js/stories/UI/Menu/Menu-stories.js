/* eslint-disable no-alert */
// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from 'storybook-addon-knobs';
import Menu from '~ds/Menu/Menu';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';

const placement = () =>
  select(
    'Placement',
    {
      'auto-start': 'auto-start',
      auto: 'auto',
      'auto-end': 'auto-end',
      'top-start': 'top-start',
      top: 'top',
      'top-end': 'top-end',
      'right-start': 'right-start',
      right: 'right',
      'right-end': 'right-end',
      'bottom-end': 'bottom-end',
      bottom: 'bottom',
      'bottom-start': 'bottom-start',
      'left-end': 'left-end',
      left: 'left',
      'left-start': 'left-start',
    },
    'bottom-end',
  );

storiesOf('Design system|Menu', module)
  .add('default', () => {
    return (
      <Flex justify="center">
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary">
              Menu
            </Button>
          </Menu.Button>
          <Menu.List>
            <Menu.ListItem>
              <Text>Preferences</Text>
            </Menu.ListItem>
            <Menu.ListItem disabled color="gray.500">
              <Text>Edit (not available yet)</Text>
            </Menu.ListItem>
            <Menu.ListItem>
              <Text>Logout</Text>
            </Menu.ListItem>
          </Menu.List>
        </Menu>
      </Flex>
    );
  })
  .add('with groups', () => {
    return (
      <Flex justify="center">
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary">
              Menu
            </Button>
          </Menu.Button>
          <Menu.List>
            <Menu.ListGroup fontWeight="semibold">
              <Text>Group 1</Text>
            </Menu.ListGroup>
            <Menu.ListItem>
              <Text>Preferences</Text>
            </Menu.ListItem>
            <Menu.ListItem disabled>
              <Text>Edit (not available yet)</Text>
            </Menu.ListItem>
            <Menu.ListGroup fontWeight="semibold">
              <Text>Group 2</Text>
            </Menu.ListGroup>
            <Menu.ListItem>
              <Text>Logout</Text>
            </Menu.ListItem>
            <Menu.ListItem disabled color="red.300">
              <Icon name="CROSS" />
              <Text>Disabled in red</Text>
            </Menu.ListItem>
            <Menu.ListItem>
              <Text>Rondon</Text>
            </Menu.ListItem>
          </Menu.List>
        </Menu>
      </Flex>
    );
  })
  .add('with icons', () => {
    return (
      <Flex justify="center">
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary">
              Menu
            </Button>
          </Menu.Button>
          <Menu.List>
            <Menu.ListItem>
              <Icon mr={1} name="BELL" />
              <Text>Notifications</Text>
            </Menu.ListItem>
            <Menu.ListItem disabled color="gray.500">
              <Icon mr={1} name="PENCIL" />
              <Text>Edit (not available yet)</Text>
            </Menu.ListItem>
            <Menu.ListItem>
              <Icon mr={1} name="CROSS" />
              <Text>Logout</Text>
            </Menu.ListItem>
          </Menu.List>
        </Menu>
      </Flex>
    );
  })
  .add('with custom button', () => {
    return (
      <Flex justify="center">
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="tertiary">
              Filtrer
            </Button>
          </Menu.Button>
          <Menu.List>
            <Menu.ListItem>
              <Icon mr={1} name="BELL" />
              <Text>Notifications</Text>
            </Menu.ListItem>
            <Menu.ListItem disabled color="gray.500">
              <Icon mr={1} name="PENCIL" />
              <Text>Edit (not available yet)</Text>
            </Menu.ListItem>
            <Menu.ListItem>
              <Icon mr={1} name="CROSS" />
              <Text>Logout</Text>
            </Menu.ListItem>
          </Menu.List>
        </Menu>
      </Flex>
    );
  })
  .add('with custom placement', () => {
    return (
      <Flex justify="center">
        <Menu placement={placement()}>
          <Menu.Button as={Button} variant="primary" rightIcon={ICON_NAME.ARROW_DOWN_O}>
            Menu
          </Menu.Button>
          <Menu.List>
            <Menu.ListItem>
              <Icon mr={1} name="BELL" />
              <Text>Notifications</Text>
            </Menu.ListItem>
            <Menu.ListItem disabled color="gray.500">
              <Icon mr={1} name="PENCIL" />
              <Text>Edit (not available yet)</Text>
            </Menu.ListItem>
            <Menu.ListItem>
              <Icon mr={1} name="CROSS" />
              <Text>Logout</Text>
            </Menu.ListItem>
          </Menu.List>
        </Menu>
      </Flex>
    );
  });
