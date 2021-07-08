// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import Section from '~ui/BackOffice/Section/Section';
import Table from '~ds/Table';
import Button from '~ds/Button/Button';
import Menu from '~ds/Menu/Menu';
import AppBox from '~ui/Primitives/AppBox';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import type { SectionSendingDomains_senderEmailDomains$key } from '~relay/SectionSendingDomains_senderEmailDomains.graphql';
import { capitalizeFirstLetter } from '~/utils/string';

type Props = {|
  +senderEmailDomains: SectionSendingDomains_senderEmailDomains$key,
|};

const FRAGMENT = graphql`
  fragment SectionSendingDomains_senderEmailDomains on SenderEmailDomain @relay(plural: true) {
    value
    service
    spfValidation
    dkimValidation
  }
`;

const SectionSendingDomains = ({
  senderEmailDomains: senderEmailDomainsFragment,
}: Props): React.Node => {
  const senderEmailDomains = useFragment(FRAGMENT, senderEmailDomainsFragment);
  const intl = useIntl();

  return (
    <Section direction="row" align="stretch" justify="space-between" spacing={4}>
      <Flex direction="column" width="30%" spacing={2}>
        <AppBox mb={7}>
          <Section.Title>{intl.formatMessage({ id: 'emailing-service' })}</Section.Title>
          <Section.Description>
            {intl.formatMessage({ id: 'emailing-service-explanation' })}
          </Section.Description>
        </AppBox>

        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          alignSelf="flex-start"
          onClick={() => {}}>
          {intl.formatMessage({ id: 'add-a-domain' })}
        </Button>
      </Flex>

      <Table width="70%">
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
          {senderEmailDomains.map((senderEmailDomain, idx) => (
            <Table.Tr key={`domain-${idx}`}>
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
                <Menu>
                  <Menu.Button as={React.Fragment}>
                    <Button
                      rightIcon={ICON_NAME.MORE}
                      aria-label={intl.formatMessage({ id: 'global.menu' })}
                      color="gray.500"
                    />
                  </Menu.Button>
                  <Menu.List>
                    <Menu.ListItem as={Button} onClick={() => {}} color="gray.900">
                      {intl.formatMessage({ id: 'action_edit' })}
                    </Menu.ListItem>
                    <Menu.ListItem as={Button} onClick={() => {}} color="gray.900">
                      {intl.formatMessage({ id: 'global.delete' })}
                    </Menu.ListItem>
                  </Menu.List>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Section>
  );
};

export default SectionSendingDomains;
