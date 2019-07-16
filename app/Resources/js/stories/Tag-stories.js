// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { Tooltip, OverlayTrigger, Button } from 'react-bootstrap';
import Tag from '../components/Ui/Labels/Tag';
import InlineList from '../components/Ui/List/InlineList';

storiesOf('Tag', module)
  .add('default', () => {
    const children = text('Children', 'Label', 'Props');
    return <Tag id="example">{children}</Tag>;
  })
  .add('with icon', () => {
    const iconClassName = text('Icon', 'cap cap-marker-1-1 icon--blue', 'Props');
    const children = text('Children', 'Label', 'Props');
    return <Tag icon={iconClassName}>{children}</Tag>;
  })
  .add('as link', () => {
    const iconClassName = text('Icon', 'cap cap-marker-1-1 icon--blue', 'Props');
    const children = text('Children', 'Label', 'Props');
    return (
      <Tag
        icon={iconClassName}
        as="a"
        href="https://ui.cap-collectif.com/"
        target="_blank"
        rel="noopener noreferrer">
        {children}
      </Tag>
    );
  })
  .add('as Button', () => {
    const iconClassName = text('Icon', 'cap cap-marker-1-1 icon--blue', 'Props');
    const children = text('Children', 'Label', 'Props');

    return (
      /* eslint-disable-next-line no-console */
      <Tag icon={iconClassName} as={Button} bsStyle="link" onClick={() => console.log('Click')}>
        {children}
      </Tag>
    );
  })
  .add('with ellipsis', () => {
    const iconClassName = text('Icon', 'cap cap-marker-1-1 icon--blue', 'Props');
    const children = text(
      'Children',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Props',
    );
    return (
      <div style={{ width: 300, padding: 5, backgroundColor: '#F7F7F7' }}>
        <Tag icon={iconClassName}>{children}</Tag>
      </div>
    );
  })
  .add('with tooltip', () => {
    const iconClassName = text('Icon', 'cap cap-marker-1-1 icon--blue', 'Props');
    const children = text('Children', 'Label', 'Props');
    const tooltip = <Tooltip id="tooltip">Example tooltip</Tooltip>;
    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <Tag icon={iconClassName}>{children}</Tag>
      </OverlayTrigger>
    );
  })
  .add('with InlineList children', () => {
    const iconClassName = text('Icon', 'cap cap-marker-1-1 icon--blue', 'Props');
    return (
      <Tag icon={iconClassName}>
        <InlineList separator="," className="d-i">
          <li>Label 1</li>
          <li>Label 2</li>
          <li>Label 3</li>
          <li>Label 4</li>
        </InlineList>
      </Tag>
    );
  });
