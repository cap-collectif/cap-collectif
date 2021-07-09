// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field } from 'redux-form';
import { type IntlShape, useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import { Container } from '../common.style';
import { InstructionContainer, ButtonMembers } from './style';
import component from '~/components/Form/Field';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import ModalMembers from '~/components/Admin/Emailing/ModalMembers/ModalMembers';
import ModalInternalMembers from '~/components/Admin/Emailing/ModalMembers/ModalInternalMembers';
import type { Parameter_query } from '~relay/Parameter_query.graphql';
import type { Parameter_emailingCampaign } from '~relay/Parameter_emailingCampaign.graphql';
import Text from '~ui/Primitives/Text';
import Tooltip from '~ds/Tooltip/Tooltip';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import { LineHeight } from '~ui/Primitives/constants';

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
  const {
    mailingLists,
    users,
    usersConfirmed,
    usersNotConfirmed,
    usersRefusing,
    usersConfirmedRefusing,
    usersNotConfirmedRefusing,
  } = query;
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const hasMailingList = !!mailingList || !!mailingInternal;
  const [countUsers, setCountUsers] = React.useState<number>(0);
  const [countUsersRefusing, setCountUsersRefusing] = React.useState<number>(0);

  React.useEffect(() => {
    if (mailingInternal) {
      switch (mailingInternal) {
        case 'CONFIRMED':
          setCountUsers(usersConfirmed.totalCount);
          setCountUsersRefusing(usersConfirmedRefusing.totalCount);
          break;
        case 'NOT_CONFIRMED':
          setCountUsers(usersNotConfirmed.totalCount);
          setCountUsersRefusing(usersNotConfirmedRefusing.totalCount);
          break;
        case 'REGISTERED':
        default:
          setCountUsers(users.totalCount);
          setCountUsersRefusing(usersRefusing.totalCount);
          break;
      }
    }

    if (mailingList) {
      setCountUsers(mailingList.mailingListUsers.totalCount);
      setCountUsersRefusing(
        mailingList.mailingListUsers.totalCount - mailingList.mailingListUsersConsenting.totalCount,
      );
    }
  }, [
    mailingInternal,
    mailingList,
    users.totalCount,
    usersConfirmed.totalCount,
    usersNotConfirmed.totalCount,
    usersRefusing.totalCount,
    usersConfirmedRefusing.totalCount,
    usersNotConfirmedRefusing.totalCount,
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
        <Flex direction="column" align="flex-start" spacing={2}>
          <Flex>
            <Icon name={ICON_NAME.USER_O} size="md" color="gray.500" />
            <Text as="span">
              {countUsers - countUsersRefusing}{' '}
              {intl.formatMessage(
                { id: 'global.members' },
                { num: countUsers - countUsersRefusing },
              )}
            </Text>
            <Tooltip
              label={intl.formatMessage(
                { id: 'has-consent-to-internal-email' },
                { num: countUsers - countUsersRefusing },
              )}>
              <AppBox lineHeight={LineHeight.Normal}>
                <Icon name={ICON_NAME.CIRCLE_INFO} size="md" color="blue.500" />
              </AppBox>
            </Tooltip>

            {mailingList?.project && (
              <>
                <Icon name={ICON_NAME.BOOK_STAR_O} size="md" color="gray.900" />
                <Text as="span">{mailingList.project.title}</Text>
              </>
            )}
          </Flex>

          {countUsers > 0 && countUsers > countUsersRefusing && (
            <ButtonMembers type="button" onClick={onOpen}>
              {intl.formatMessage({ id: 'consult-members' })}
            </ButtonMembers>
          )}
        </Flex>
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
        mailingListUsersConsenting: users(first: 0, consentInternalCommunicationOnly: true) {
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
      usersRefusing: users(first: 0, consentInternalCommunication: false) {
        totalCount
      }
      usersConfirmed: users(first: 0, emailConfirmed: true) {
        totalCount
      }
      usersConfirmedRefusing: users(
        first: 0
        emailConfirmed: true
        consentInternalCommunication: false
      ) {
        totalCount
      }
      usersNotConfirmed: users(first: 0, emailConfirmed: false) {
        totalCount
      }
      usersNotConfirmedRefusing: users(
        first: 0
        emailConfirmed: false
        consentInternalCommunication: false
      ) {
        totalCount
      }
    }
  `,
});
