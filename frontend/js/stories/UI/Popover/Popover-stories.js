// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from 'storybook-addon-knobs';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Popover from '~ds/Popover/index';
import Heading from '~ui/Primitives/Heading';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';

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
    'top',
  );

storiesOf('Design system|Popover', module)
  .add('default', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Popover placement={placement()}>
          <Popover.Trigger>
            <Button variant="primary" variantSize="medium">
              Hover moi
            </Button>
          </Popover.Trigger>

          <Popover.Content>
            <Popover.Header>Header</Popover.Header>
            <Popover.Body>Body</Popover.Body>
            <Popover.Footer>Footer</Popover.Footer>
          </Popover.Content>
        </Popover>
      </Flex>
    );
  })
  .add('custom header', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Popover placement={placement()}>
          <Popover.Trigger>
            <Button variant="primary" variantSize="medium">
              Hover moi
            </Button>
          </Popover.Trigger>

          <Popover.Content>
            <Popover.Header>
              <Heading as="h2">Header</Heading>
            </Popover.Header>
            <Popover.Body>Body</Popover.Body>
            <Popover.Footer>Footer</Popover.Footer>
          </Popover.Content>
        </Popover>
      </Flex>
    );
  })
  .add('with trigger click', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Popover placement={placement()} trigger={['click']}>
          <Popover.Trigger>
            <Button variant="primary" variantSize="medium">
              Hover moi
            </Button>
          </Popover.Trigger>

          <Popover.Content>
            <Popover.Header>Welcome</Popover.Header>
            <Popover.Body>Body</Popover.Body>
            <Popover.Footer>
              <ButtonGroup>
                <Button>Cancel</Button>
                <Button>Confirm</Button>
              </ButtonGroup>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
      </Flex>
    );
  })
  .add('with close method', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Popover placement={placement()} trigger={['click']}>
          <Popover.Trigger>
            <Button variant="primary" variantSize="medium">
              Hover moi
            </Button>
          </Popover.Trigger>

          <Popover.Content>
            {({ closePopover }) => (
              <React.Fragment>
                <Popover.Header>Welcome</Popover.Header>
                <Popover.Body>Body</Popover.Body>
                <Popover.Footer>
                  <ButtonGroup>
                    <Button onClick={closePopover}>Click here to close</Button>
                    <Button>Confirm</Button>
                  </ButtonGroup>
                </Popover.Footer>
              </React.Fragment>
            )}
          </Popover.Content>
        </Popover>
      </Flex>
    );
  });
