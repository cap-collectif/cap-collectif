// @flow
import * as React from 'react';
import { Field, getFormSyncErrors, isSubmitting } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { NavLink } from 'react-router-dom';
import component from '~/components/Form/Field';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import LabelState from '~/components/Admin/Emailing/MailParameter/LabelState/LabelState';
import {
  formName,
  PATHS,
  selectorForm,
} from '~/components/Admin/Emailing/MailParameter/MailParameterPage';
import {
  Container,
  ButtonCancelPlanned,
  ButtonEditTitle,
  ButtonSendContainer,
  ButtonSendMail,
  ErrorContainer,
  LabelPlannedContainer,
  NavContainer,
  Title,
  TitleContainer,
} from './Header.style';
import type { Header_emailingCampaign } from '~relay/Header_emailingCampaign.graphql';
import type { GlobalState } from '~/types';

type Error = {|
  id: string,
  values: { fieldName: React.Node },
|};

type ReduxProps = {|
  title: string,
  submitting: boolean,
  errors: {|
    [string]: Error,
  |},
|};

type Props = {|
  ...ReduxProps,
  emailingCampaign: Header_emailingCampaign,
  disabled: boolean,
  showError: boolean,
  setModalCancelOpen: boolean => void,
|};

export const Header = ({
  emailingCampaign,
  title,
  showError,
  errors,
  disabled,
  setModalCancelOpen,
  submitting,
}: Props) => {
  const intl = useIntl();
  const [isEditMode, setEditMode] = React.useState<boolean>(false);
  const { status } = emailingCampaign;

  return (
    <Container>
      <TitleContainer>
        <Title>
          {isEditMode ? (
            <Field
              type="text"
              id="title"
              name="title"
              component={component}
              disabled={disabled}
              disableValidation={!showError}
            />
          ) : (
            <h2>{title}</h2>
          )}

          {!disabled && (
            <ButtonEditTitle type="button" onClick={() => setEditMode(!isEditMode)}>
              <Icon name={isEditMode ? ICON_NAME.check : ICON_NAME.pen} size={16} color="#000" />
            </ButtonEditTitle>
          )}
        </Title>

        {status === 'DRAFT' && (
          <ButtonSendContainer>
            <ButtonSendMail type="submit" disabled={submitting}>
              {intl.formatMessage({ id: 'check-and-send' })}
            </ButtonSendMail>

            {showError && (
              <ErrorContainer>
                <p>
                  <Icon name={ICON_NAME.danger} size={14} color={colors.dangerColor} />
                  {intl.formatMessage({ id: 'admin.fields.question_choice.required' })}
                </p>

                <div>
                  {((Object.values(errors): any): Error[]).map((error, idx) => (
                    <p key={idx}>
                      <span>{`${idx + 1}. `}</span>
                      <FormattedMessage
                        id={error.id}
                        values={{ fieldName: error.values.fieldName }}
                      />
                    </p>
                  ))}
                </div>
              </ErrorContainer>
            )}
          </ButtonSendContainer>
        )}

        {status === 'PLANNED' && (
          <LabelPlannedContainer>
            <LabelState
              color={colors.fireBush}
              label={intl.formatMessage({ id: 'global-planned' })}
            />
            <ButtonCancelPlanned type="button" onClick={() => setModalCancelOpen(true)}>
              {intl.formatMessage({ id: 'cancel' })}
            </ButtonCancelPlanned>
          </LabelPlannedContainer>
        )}

        {status === 'SENT' && (
          <LabelState color={colors.tradewind} label={intl.formatMessage({ id: 'global-sent' })} />
        )}
      </TitleContainer>

      <NavContainer>
        <li>
          <NavLink to={PATHS.PARAMETER} activeClassName="selected" exact>
            {intl.formatMessage({ id: 'global.params' })}
          </NavLink>
        </li>

        <li>
          <NavLink to={PATHS.CONTENT} activeClassName="selected" exact>
            {intl.formatMessage({ id: 'global.contenu' })}
          </NavLink>
        </li>

        <li>
          <NavLink to={PATHS.SENDING} activeClassName="selected" exact>
            {intl.formatMessage({ id: 'global-sending' })}
          </NavLink>
        </li>
      </NavContainer>
    </Container>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  title: selectorForm(state, 'title'),
  errors: getFormSyncErrors(formName)(state),
  submitting: isSubmitting(formName)(state),
});

const HeaderConnected = connect(mapStateToProps)(Header);

export default createFragmentContainer(HeaderConnected, {
  emailingCampaign: graphql`
    fragment Header_emailingCampaign on EmailingCampaign {
      status
    }
  `,
});
