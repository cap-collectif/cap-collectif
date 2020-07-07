// @flow
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { storiesOf } from '@storybook/react';
import ClearableInput from '~ui/Form/Input/ClearableInput';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

const noop = () => {};

storiesOf('Core|Input/Clearable Input', module)
  .add('default', () => {
    return (
      <Row>
        <Col xs={12} sm={6} md={4} lg={3}>
          <ClearableInput
            id="search"
            name="search"
            type="text"
            placeholder="Je suis vide..."
            onClear={noop}
            onSubmit={noop}
          />
        </Col>
      </Row>
    );
  })
  .add('with a svg icon', () => {
    return (
      <Row>
        <Col xs={12} sm={6} md={4} lg={3}>
          <ClearableInput
            id="search"
            name="search"
            icon={<Icon name={ICON_NAME.twitter} />}
            type="text"
            placeholder="@CapCollectif"
            onClear={noop}
            onSubmit={noop}
          />
        </Col>
      </Row>
    );
  })
  .add('with a font icon', () => {
    return (
      <Row>
        <Col xs={12} sm={6} md={4} lg={3}>
          <ClearableInput
            id="search"
            name="search"
            icon={<i className="cap cap-magnifier" />}
            type="text"
            placeholder="@CapCollectif"
            onClear={noop}
            onSubmit={noop}
          />
        </Col>
      </Row>
    );
  })
  .add('disabled', () => {
    return (
      <Row>
        <Col xs={12} sm={6} md={4} lg={3}>
          <ClearableInput
            disabled
            id="search"
            name="search"
            type="text"
            placeholder="Je suis disabled..."
            onClear={noop}
            onSubmit={noop}
          />
        </Col>
      </Row>
    );
  });
