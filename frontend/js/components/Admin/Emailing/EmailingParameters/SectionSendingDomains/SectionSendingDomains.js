// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import Section from '~ui/BackOffice/Section/Section';
import Table from '~ds/Table';
import AppBox from '~ui/Primitives/AppBox';
import Icon from '~ds/Icon/Icon';
import type { SectionSendingDomains_senderEmailDomains$key } from '~relay/SectionSendingDomains_senderEmailDomains.graphql';
import type { SectionSendingDomains_senderEmails$key } from '~relay/SectionSendingDomains_senderEmails.graphql';
import { capitalizeFirstLetter } from '~/utils/string';
import ModalsAddDomain from '../ModalsAddDomain/ModalsAddDomain';
import ModalConfirmationDomainDelete from '../ModalConfirmationDomainDelete/ModalConfirmationDomainDelete';
import Link from '~ds/Link/Link';

type Props = {|
  +senderEmailDomains: SectionSendingDomains_senderEmailDomains$key,
  +senderEmails: SectionSendingDomains_senderEmails$key,
|};

const FRAGMENT_SENDER_EMAIL_DOMAIN = graphql`
  fragment SectionSendingDomains_senderEmailDomains on SenderEmailDomain @relay(plural: true) {
    id
    value
    service
    spfValidation
    dkimValidation
    ...ModalConfirmationDomainDelete_senderEmailDomain
  }
`;

const FRAGMENT_SENDER_EMAILS = graphql`
  fragment SectionSendingDomains_senderEmails on SenderEmail @relay(plural: true) {
    address
  }
`;

const SectionSendingDomains = ({
  senderEmailDomains: senderEmailDomainsFragment,
  senderEmails: senderEmailsFragment,
}: Props): React.Node => {
  const senderEmailDomains = useFragment(FRAGMENT_SENDER_EMAIL_DOMAIN, senderEmailDomainsFragment);
  const senderEmails = useFragment(FRAGMENT_SENDER_EMAILS, senderEmailsFragment);
  const intl = useIntl();

  return (
    <Section direction="row" align="stretch" justify="space-between" spacing={4}>
      <Flex direction="column" width="30%" spacing={2}>
        <AppBox mb={7}>
          <Section.Title>{intl.formatMessage({ id: 'emailing-service' })}</Section.Title>
          <Section.Description>
            {intl.formatMessage({ id: 'emailing-service-explanation' })}{' '}
            <Link
              href="https://aide.cap-collectif.com/article/249-authentification-de-votre-domaine-d-envoi"
              target="blank"
              rel="noopener noreferrer">
              {intl.formatMessage({ id: 'learn.more' })}
            </Link>
          </Section.Description>
        </AppBox>

        <ModalsAddDomain intl={intl} />
      </Flex>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'global.domain' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.service' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.spf' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.dkim' })}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {senderEmailDomains.map(senderEmailDomain => (
            <Table.Tr rowId={senderEmailDomain.id} key={senderEmailDomain.id}>
              <Table.Td>{senderEmailDomain.value}</Table.Td>
              <Table.Td>{capitalizeFirstLetter(senderEmailDomain.service.toLowerCase())}</Table.Td>
              <Table.Td>
                <Icon
                  name={senderEmailDomain.spfValidation ? 'CIRCLE_CHECK' : 'CIRCLE_CROSS'}
                  color={senderEmailDomain.spfValidation ? 'green.500' : 'red.500'}
                />
              </Table.Td>
              <Table.Td>
                <Icon
                  name={senderEmailDomain.dkimValidation ? 'CIRCLE_CHECK' : 'CIRCLE_CROSS'}
                  color={senderEmailDomain.dkimValidation ? 'green.500' : 'red.500'}
                />
              </Table.Td>

              <Table.Td>
                {!senderEmails.some(senderEmail =>
                  senderEmail.address.includes(senderEmailDomain.value),
                ) && <ModalConfirmationDomainDelete senderEmailDomain={senderEmailDomain} />}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Section>
  );
};

export default SectionSendingDomains;
