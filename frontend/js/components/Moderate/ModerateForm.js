// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import toggle from '~/components/Form/Toggle';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import component from '~/components/Form/Field';
import Tooltip from '~ds/Tooltip/Tooltip';

export const formName = 'moderate-form';

type Props = ReduxFormFormProps;

export type Values = {|
  hideContent: boolean,
  reason: string,
|};

const ModerateForm: React.StatelessFunctionalComponent<Props> = ({ handleSubmit }: Props) => {
  const intl = useIntl();

  return (
    <form id={formName} onSubmit={handleSubmit}>
      <Field
        bold
        component={toggle}
        name="hideContent"
        id="toggle-isVisible"
        normalize={val => !!val}
        label={
          <div>
            <FormattedMessage id="toggle.hide.content" />
            <Tooltip
              visible
              placement="bottom"
              label={intl.formatMessage({ id: 'tooltip.explanation.hide.content' })}
              id="tooltip-description"
              className="text-left"
              style={{ wordBreak: 'break-word' }}>
              <div>
                <Icon
                  name={ICON_NAME.information}
                  size={12}
                  color={colors.iconGrayColor}
                  className="ml-5"
                />
              </div>
            </Tooltip>
          </div>
        }
      />

      <Field
        type="text"
        name="reason"
        id="reason"
        component={component}
        label={
          <>
            <FormattedMessage id="global.moderation.reason" />{' '}
            <span className="excerpt">
              <FormattedMessage id="global.optional" />
            </span>
          </>
        }
      />
    </form>
  );
};

const container = reduxForm({
  form: formName,
})(ModerateForm);

export default container;
