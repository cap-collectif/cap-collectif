// @flow
import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { change, Field } from 'redux-form';
import component from '../../Form/Field';
import toggle from '../../Form/Toggle';
import withPanelStyle from './withPanelStyle';
import { PanelHeader, PanelBody } from './PanelStyle.style';
import { formName, selector } from '~/components/ProposalForm/ProposalFormAdminConfigurationForm';
import type { State } from '~/types';

type Props = {
  member: string,
  isPanelOpen: boolean,
  handlePanelToggle: () => void,
  dispatch: Dispatch,
  opacity: ?number,
};

const PanelBackgroundStyle = ({
  member,
  isPanelOpen,
  handlePanelToggle,
  dispatch,
  opacity,
}: Props) => (
  <Panel expanded={isPanelOpen} onToggle={() => {}}>
    <PanelHeader>
      <Field
        component={toggle}
        id="background-enabled"
        name={`${member}.background.enabled`}
        onChange={handlePanelToggle}
        label={<FormattedMessage id="background" />}
        normalize={val => !!val}
        format={val => !!val}
      />
    </PanelHeader>

    <Panel.Collapse>
      <PanelBody>
        <Field
          component={component}
          type="color-picker"
          opacity={opacity}
          getOpacity={colorOpacity =>
            dispatch(change(formName, `${member}.background.opacity`, colorOpacity))
          }
          id="color"
          placeholder="#000000"
          name={`${member}.background.color`}
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
          name={`${member}.background.opacity`}
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
      </PanelBody>
    </Panel.Collapse>
  </Panel>
);

const mapStateToProps = (state: State, props: Props) => ({
  opacity: selector(state, `${props.member}.background.opacity`),
});

export default withPanelStyle(connect(mapStateToProps)(PanelBackgroundStyle));
