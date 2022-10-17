// @flow
import * as React from 'react';
import { Field, getFormSyncErrors, isSubmitting, formValueSelector } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useResize } from '@liinkiing/react-hooks';
import { createFragmentContainer, graphql } from 'react-relay';
import { NavLink } from 'react-router-dom';
import component from '~/components/Form/Field';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import LabelState from '~/components/Admin/Emailing/MailParameter/LabelState/LabelState';
import {
  Container,
  ButtonCancelPlanned,
  ButtonSendContainer,
  ButtonSendMail,
  ErrorContainer,
  LabelPlannedContainer,
  NavContainer,
  TitleContainer,
} from './Header.style';
import type { Header_emailingCampaign } from '~relay/Header_emailingCampaign.graphql';
import type { GlobalState } from '~/types';
import Tooltip from '~ds/Tooltip/Tooltip';

export const PATHS = {
  PARAMETER: '/',
  CONTENT: '/content',
  SENDING: '/sending',
};

export const formName = 'form-edit-emailing-campaign';

export const selectorForm = formValueSelector(formName);

type Error = {|
  id: string,
  values?: { fieldName: React.Node },
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
  const { status } = emailingCampaign;
  const { width: widthWindow } = useResize();

  const [widthTitle, setWidthTitle] = React.useState<number>(100);
  const [maxWidthTitle, setMaxWidthTitle] = React.useState<number>(widthWindow);
  const [titleFocus, setTitleFocus] = React.useState<boolean>(false);

  const refTitle = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (refTitle.current && title) {
      // Adapt input width to content width
      setWidthTitle(refTitle?.current?.offsetWidth || 100);
    }

    // This ratio keep the same interface for all kind of width of screen
    const MAX_WIDTH_TITLE = widthWindow * 0.7;
    setMaxWidthTitle(MAX_WIDTH_TITLE);
  }, [title, widthWindow, refTitle]);

  return (
    <Container>
      <TitleContainer>
        {!disabled ? (
          <Tooltip
            placement="top"
            id="tooltip-title"
            label={intl.formatMessage({ id: 'global.rename' })}>
            <div className="input-title">
              <Field
                type="text"
                id="title"
                name="title"
                component={component}
                disabled={disabled}
                disableValidation={!showError}
                style={{
                  width: widthTitle <= maxWidthTitle ? `${widthTitle}px` : `${maxWidthTitle}px`,
                }}
                onFocus={() => setTitleFocus(true)}
                onBlur={() => setTitleFocus(false)}
              />

              <div
                className="wrapper-title"
                ref={refTitle}
                style={{
                  maxWidth: `${maxWidthTitle}px`,
                  visibility: !titleFocus ? 'visible' : 'hidden',
                }}>
                <span>{title}</span>
              </div>
            </div>
          </Tooltip>
        ) : (
          <div
            className="wrapper-title not-editable"
            style={{
              maxWidth: `${maxWidthTitle}px`,
            }}>
            <span>{title}</span>
          </div>
        )}

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

                      {error.values ? (
                        <FormattedMessage
                          id={error.id}
                          values={{ fieldName: error.values.fieldName }}
                        />
                      ) : (
                        <FormattedMessage id={error.id} />
                      )}
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
  title: selectorForm(state, 'title') || '',
  errors: getFormSyncErrors(formName)(state),
  submitting: isSubmitting(formName)(state),
});

const HeaderConnected = connect<any, any, _, _, _, _>(mapStateToProps)(Header);

export default createFragmentContainer(HeaderConnected, {
  emailingCampaign: graphql`
    fragment Header_emailingCampaign on EmailingCampaign {
      status
    }
  `,
});
