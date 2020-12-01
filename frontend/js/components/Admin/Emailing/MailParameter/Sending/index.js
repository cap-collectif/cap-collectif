// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { change, Field } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { ToggleButton } from 'react-bootstrap';
import { Container } from '../common.style';
import component from '~/components/Form/Field';
import type { Dispatch, GlobalState } from '~/types';
import { formName, selectorForm } from '../MailParameterPage';
import { FieldContainer, InfoRow } from './style';
import LabelState from '~/components/Admin/Emailing/MailParameter/LabelState/LabelState';
import colors from '~/utils/colors';
import { type Sending_emailingCampaign } from '~relay/Sending_emailingCampaign.graphql';

type Props = {|
  emailingCampaign: Sending_emailingCampaign,
  dispatch: Dispatch,
  sendingSchedule: boolean,
  disabled: boolean,
  showError: boolean,
  plannedDate?: string,
|};

const isValidDate = (current: moment) => {
  const yesterday = moment().subtract(1, 'days');
  return current.isAfter(yesterday);
};

export const DIFF_MINUTE = 6;

export const SendingPage = ({
  dispatch,
  sendingSchedule,
  disabled,
  emailingCampaign,
  showError,
}: Props) => {
  const { status, sendAt } = emailingCampaign;
  const intl = useIntl();

  return (
    <Container disabled={disabled}>
      <h3>{intl.formatMessage({ id: 'send-and-schedule' })}</h3>

      <FieldContainer>
        <Field
          type="radio-buttons"
          id="sendingSchedule"
          name="sendingSchedule"
          disabled={disabled}
          label={intl.formatMessage({ id: 'send-parameter' })}
          component={component}
          disableValidation={!showError}>
          <ToggleButton
            id="now"
            onClick={() => dispatch(change(formName, 'sendingSchedule', false))}
            value={false}
            disabled={disabled}>
            <FormattedMessage id="send-now" />
          </ToggleButton>
          <ToggleButton
            id="planned"
            value={!!1}
            onClick={() => dispatch(change(formName, 'sendingSchedule', true))}
            disabled={disabled}>
            <FormattedMessage id="global.plan" />
          </ToggleButton>
        </Field>

        {sendingSchedule && (
          <Field
            id="plannedDate"
            name="plannedDate"
            type="datetime"
            component={component}
            dateTimeInputProps={{
              disabled,
            }}
            label={<FormattedMessage id="sending-date" />}
            addonAfter={<i className="cap-calendar-2" />}
            disabled={disabled}
            disableValidation={!showError}
            isValidDate={isValidDate}
          />
        )}
      </FieldContainer>

      {status === 'PLANNED' && (
        <InfoRow>
          <LabelState color={colors.fireBush} />
          <p>
            {intl.formatMessage(
              { id: 'global.plannedDate' },
              {
                date: intl.formatDate(moment(sendAt), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
              },
            )}
          </p>
        </InfoRow>
      )}

      {status === 'SENT' && (
        <InfoRow>
          <LabelState color={colors.tradewind} />
          <p>
            {intl.formatMessage(
              { id: 'global.sentAt.date' },
              {
                date: intl.formatDate(moment(sendAt), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
              },
            )}
          </p>
        </InfoRow>
      )}
    </Container>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  sendingSchedule: selectorForm(state, 'sendingSchedule'),
  plannedDate: selectorForm(state, 'plannedDate'),
});

const SendingPageConnected = connect(mapStateToProps)(SendingPage);

export default createFragmentContainer(SendingPageConnected, {
  emailingCampaign: graphql`
    fragment Sending_emailingCampaign on EmailingCampaign {
      status
      sendAt
    }
  `,
});
