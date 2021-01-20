// @flow
import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { change, Field, formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import component from '../../Form/Field';
import toggle from '../../Form/Toggle';
import withPanelStyle from './withPanelStyle';
import { PanelBody, PanelHeader } from './PanelStyle.style';
import type { State, Dispatch } from '~/types';

type Props = {
  member: string,
  isPanelOpen: boolean,
  handlePanelToggle: () => void,
  dispatch: Dispatch,
  opacity?: number,
  formName: string,
};

const PanelBorderStyle = ({
  member,
  isPanelOpen,
  handlePanelToggle,
  dispatch,
  opacity,
  formName,
}: Props) => (
  <Panel expanded={isPanelOpen} onToggle={() => {}}>
    <PanelHeader>
      <Field
        component={toggle}
        id="border-enabled"
        name={`${member}.border.enabled`}
        onChange={handlePanelToggle}
        label={<FormattedMessage id="border" />}
        normalize={val => !!val}
        format={val => !!val}
      />
    </PanelHeader>

    <Panel.Collapse>
      <PanelBody>
        <Field
          component={component}
          type="color-picker"
          id="color"
          opacity={opacity}
          getOpacity={colorOpacity =>
            dispatch(change(formName, `${member}.border.opacity`, colorOpacity))
          }
          placeholder="#000000"
          name={`${member}.border.color`}
          label={
            <div>
              <FormattedMessage id="global.color" />
              <div className="excerpt inline">
                <FormattedMessage id="unit.hex" />
              </div>
            </div>
          }
        />
        <Field
          component={component}
          type="number"
          min={1}
          max={100}
          id="opacity"
          name={`${member}.border.opacity`}
          normalize={val => (val && !Number.isNaN(parseInt(val, 10)) ? parseInt(val, 10) : 0)}
          label={
            <div>
              <FormattedMessage id="opacity" />
              <div className="excerpt inline">
                <FormattedMessage id="unit.percentage" />
              </div>
            </div>
          }
        />
        <Field
          component={component}
          type="number"
          id="size"
          name={`${member}.border.size`}
          normalize={val => (val && !Number.isNaN(parseInt(val, 10)) ? parseInt(val, 10) : null)}
          label={
            <span>
              <FormattedMessage id="thickness" />
              <span className="excerpt inline">
                <FormattedMessage id="unit.pixel" />
              </span>
            </span>
          }
        />
      </PanelBody>
    </Panel.Collapse>
  </Panel>
);

const mapStateToProps = (state: State, { formName, member }: Props) => {
  const selector = formValueSelector(formName);
  return {
    opacity: selector(state, `${member}.border.opacity`),
  };
};

export default withPanelStyle(connect(mapStateToProps)(PanelBorderStyle));
