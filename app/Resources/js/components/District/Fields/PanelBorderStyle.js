// @flow
import * as React from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
// $FlowFixMe
import { FormSection, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
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

const PanelBorderStyle = ({ member, isPanelOpen, opacities, handlePanelToggle }: Props) => (
  <Panel expanded={isPanelOpen} onToggle={() => {}}>
    <Panel.Heading>
      <Row>
        <Col md={8} xs={6}>
          <h4>
            <FormattedMessage id="border" />
          </h4>
        </Col>
        <Col md={4} xs={6} style={{ paddingLeft: '50px' }}>
          <FormSection name={`${member}.border`}>
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
          </FormSection>
        </Col>
      </Row>
    </Panel.Heading>
    <Panel.Collapse>
      <Panel.Body>
        <FormSection name={`${member}.border`}>
          <Field
            component={component}
            type="number"
            id="size"
            name="size"
            normalize={value => (!value || isNaN(value) ? 1 : parseInt(value, 10))}
            label={<FormattedMessage id="thickness" />}
          />
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
        </FormSection>
      </Panel.Body>
    </Panel.Collapse>
  </Panel>
);

export default withPanelStyle(PanelBorderStyle);
