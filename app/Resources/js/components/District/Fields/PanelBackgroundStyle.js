// @flow
import * as React from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
// $FlowFixMe
import { FormSection, Field } from 'redux-form';
import component from '../../Form/Field';
import colorPicker from '../../Form/ColorPicker';
import toggle from '../../Form/Toggle';
import withPanelStyle from './withPanelStyle';

type Props = {
  member: string,
  isPanelOpen: boolean,
  opacities: Array<number>,
  handlePanelToggle: () => void,
};

const PanelBackgroundStyle = ({ member, isPanelOpen, opacities, handlePanelToggle }: Props) => (
  <Panel expanded={isPanelOpen} onToggle={() => {}}>
    <FormSection name={`${member}.background`}>
      <Panel.Heading>
        <Row>
          <Col md={6}>
            <h4>
              <FormattedMessage id="background" />
            </h4>
          </Col>
          <Col md={6}>
            <Field
              component={toggle}
              type="checkbox"
              labelSide="RIGHT"
              id="enabled"
              name="enabled"
              onChange={handlePanelToggle}
              normalize={val => !!val}
              format={val => !!val}
            />
          </Col>
        </Row>
      </Panel.Heading>
      <Panel.Collapse>
        <Panel.Body>
          <Field
            component={component}
            type="select"
            id="opacity"
            name="opacity"
            format={value => String(value * 100)}
            normalize={value => parseFloat(value / 100)}
            label={<FormattedMessage id="opacity" />}>
            {opacities.map(opacityValue => (
              <option key={opacityValue} value={opacityValue}>
                {opacityValue}
              </option>
            ))}
          </Field>
          <Field
            component={colorPicker}
            type="text"
            id="color"
            name="color"
            label={<FormattedMessage id="color" />}
          />
        </Panel.Body>
      </Panel.Collapse>
    </FormSection>
  </Panel>
);

export default withPanelStyle(PanelBackgroundStyle);
