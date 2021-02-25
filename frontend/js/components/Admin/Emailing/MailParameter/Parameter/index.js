// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field } from 'redux-form';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import { Container } from '../common.style';
import { InstructionContainer, InfoRow, InfoMailingList, ButtonMembers } from './style';
import component from '~/components/Form/Field';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import ModalMembers from '~/components/Admin/Emailing/ModalMembers/ModalMembers';
import ModalInternalMembers from '~/components/Admin/Emailing/ModalMembers/ModalInternalMembers';
import colors from '~/utils/colors';
import type { Parameter_query } from '~relay/Parameter_query.graphql';
import type { Parameter_emailingCampaign } from '~relay/Parameter_emailingCampaign.graphql';

export const DEFAULT_MAILING_LIST = ['REGISTERED', 'CONFIRMED', 'NOT_CONFIRMED'];

type Props = {|
  emailingCampaign: Parameter_emailingCampaign,
  query: Parameter_query,
  disabled: boolean,
  showError: boolean,
|};

export const getWordingMailingInternal = (mailingInternal: string, intl: IntlShape) => {
  switch (mailingInternal) {
    case 'CONFIRMED':
      return intl.formatMessage({ id: 'default-mailing-list-registered-confirmed' });
    case 'NOT_CONFIRMED':
      return intl.formatMessage({ id: 'default-mailing-list-registered-not-confirmed' });
    case 'REGISTERED':
      return intl.formatMessage({ id: 'default-mailing-list-registered' });
    default:
      return '';
  }
};

export const ParameterPage = ({ emailingCampaign, query, disabled, showError }: Props) => {
  const { mailingList, mailingInternal } = emailingCampaign;
  const { mailingLists, users, usersConfirmed, usersNotConfirmed } = query;
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const hasMailingList = !!mailingList || !!mailingInternal;
  const [countUsers, setCountUsers] = React.useState<number>(0);

  React.useEffect(() => {
    if (mailingInternal) {
      switch (mailingInternal) {
        case 'CONFIRMED':
          setCountUsers(usersConfirmed.totalCount);
          break;
        case 'NOT_CONFIRMED':
          setCountUsers(usersNotConfirmed.totalCount);
          break;
        case 'REGISTERED':
        default:
          setCountUsers(users.totalCount);
          break;
      }
    }

    if (mailingList) {
      setCountUsers(mailingList.mailingListUsers.totalCount);
    }
  }, [
    mailingInternal,
    mailingList,
    users.totalCount,
    usersConfirmed.totalCount,
    usersNotConfirmed.totalCount,
  ]);

  return (
    <Container disabled={disabled}>
      <h3>{intl.formatMessage({ id: 'admin-title-parameter-mailing-list' })}</h3>

      <Field
        type="text"
        id="senderEmail"
        name="senderEmail"
        component={component}
        label={intl.formatMessage({ id: 'sender-address' })}
        disabled
        disableValidation={!showError}
      />

      <Field
        type="select"
        id="mailingList"
        name="mailingList"
        component={component}
        label={intl.formatMessage({ id: 'admin-menu-emailing-list' })}
        disabled={disabled}
        disableValidation={!showError}>
        <option value="" disabled>
          {intl.formatMessage({ id: 'select-list' })}
        </option>
        <option value="REGISTERED">{getWordingMailingInternal('REGISTERED', intl)}</option>
        <option value="CONFIRMED">{getWordingMailingInternal('CONFIRMED', intl)}</option>
        <option value="NOT_CONFIRMED">{getWordingMailingInternal('NOT_CONFIRMED', intl)}</option>

        {mailingLists?.totalCount > 0 &&
          mailingLists?.edges
            ?.filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
      </Field>

      {hasMailingList && countUsers > 0 && (
        <InfoMailingList>
          <InfoRow>
            <Icon name={ICON_NAME.newUser} size={13} color={colors.darkText} />
            <p>
              <span>{countUsers}</span>{' '}
              <FormattedMessage id="global.members" values={{ num: countUsers }} />
            </p>

            {mailingList?.project && (
              <p>
                <Icon name={ICON_NAME.favoriteBook} size={16} color={colors.darkText} />
                <span>{mailingList.project.title}</span>
              </p>
            )}
          </InfoRow>

          {countUsers > 0 && (
            <ButtonMembers type="button" onClick={onOpen}>
              {intl.formatMessage({ id: 'consult-members' })}
            </ButtonMembers>
          )}
        </InfoMailingList>
      )}

      <InstructionContainer>
        <p
          dangerouslySetInnerHTML={{
            __html: intl.formatHTMLMessage(
              { id: 'admin-help-mailing-list-access' },
              { linkProject: '/admin/capco/app/project/list' },
            ),
          }}
        />
      </InstructionContainer>

      {hasMailingList &&
        (mailingInternal ? (
          <ModalInternalMembers show={isOpen} onClose={onClose} type={mailingInternal} />
        ) : (
          <ModalMembers show={isOpen} onClose={onClose} mailingList={mailingList} />
        ))}
    </Container>
  );
};

export default createFragmentContainer(ParameterPage, {
  emailingCampaign: graphql`
    fragment Parameter_emailingCampaign on EmailingCampaign {
      mailingList {
        name
        project {
          title
        }
        mailingListUsers: users(first: 0) {
          totalCount
        }
        ...ModalMembers_mailingList
      }
      mailingInternal
    }
  `,
  query: graphql`
    fragment Parameter_query on Query {
      mailingLists {
        totalCount
        edges {
          node {
            id
            name
          }
        }
      }
      users(first: 0) {
        totalCount
      }
      usersConfirmed: users(first: 0, emailConfirmed: true) {
        totalCount
      }
      usersNotConfirmed: users(first: 0, emailConfirmed: false) {
        totalCount
      }
    }
  `,
});
