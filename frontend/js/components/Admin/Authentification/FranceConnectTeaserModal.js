// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Link from '~ds/Link/Link';
import type { GlobalState } from '~/types';

const generateMailTo = (intl, organizationName: string) => {
  const email = 'commercial@cap-collectif.com';
  const subject = intl.formatMessage({ id: 'france.connect.mailto.subject' }, { organizationName });
  const body = intl.formatMessage({ id: 'france.connect.mailto.body' });

  return `mailto:${email}?subject=${subject}&body=${body}`;
};

const FranceConnectLogo = styled.img`
  width: 116px;
  transform: translateZ(0);
`;

const ListItem = ({ children }) => (
  <Flex alignItems="center">
    <Icon name="CHECK_O" size="md" color="blue.500" />
    <Text ml={1} color="blue.800" fontSize={3}>
      {children}
    </Text>
  </Flex>
);

export const FranceConnectTeaserModal = () => {
  const intl = useIntl();
  const organizationName: string = useSelector(
    (state: GlobalState) => state.default.parameters['global.site.organization_name'],
  );

  const mailTo = generateMailTo(intl, organizationName);

  return (
    <Modal
      hideOnEsc
      ariaLabel={intl.formatMessage({ id: 'france.connect.teaser' })}
      disclosure={
        <Button variant="tertiary" variantSize="small">
          {intl.formatMessage({ id: 'global.install' })}
        </Button>
      }
      maxWidth="555px">
      <Modal.Header>
        <Text color="gray.500" fontWeight={700} fontSize={1} uppercase>
          {intl.formatMessage({ id: 'activate.france.connect' })}
        </Text>
        <Text color="blue.900" fontWeight={600} fontSize={4}>
          {intl.formatMessage({ id: 'secure.and.simplify.the.connection' })}
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Text fontSize={2} color="gray.900" mb={6}>
          {intl.formatMessage({ id: 'france.connect.business.contact' })}
        </Text>
        <AppBox>
          <Flex
            direction="column"
            backgroundColor="blue.100"
            padding={6}
            alignItems="center"
            border="normal"
            borderColor="blue.200"
            borderRadius="card">
            <FranceConnectLogo src="/image/logo_FC.png" alt="FranceConnectLogo" />
            <Text color="blue.900" fontSize={6} fontWeight="600" my={4}>
              1000{' '}
              <Text as="span" fontSize={4} fontWeight={400}>
                € HT
              </Text>
            </Text>
            <Text
              color="green.800"
              backgroundColor="green.150"
              fontSize={2}
              paddingX={2}
              paddingY={1}>
              {intl.formatMessage({ id: 'france.connect.discount' })}
            </Text>
            <Flex mt={4} direction="column">
              <ListItem>
                {intl.formatMessage({ id: 'france.connect.unique.user.per.account' })}
              </ListItem>
              <ListItem>{intl.formatMessage({ id: 'france.connect.infos.verified' })}</ListItem>
              <ListItem>
                {intl.formatMessage({ id: 'france.connect.participants.time.saver' })}
              </ListItem>
            </Flex>
          </Flex>
        </AppBox>
        <Text color="gray.700" mt={4} fontSize={1}>
          {intl.formatMessage({ id: 'france.connect.municipalities.less.than' }, { n: '10 000' })}
        </Text>
      </Modal.Body>
      <Modal.Footer spacing={2} as="div">
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <Flex alignItems="center">
            <Icon name={ICON_NAME.CIRCLE_INFO} color="blue.500" />
            <Link href="https://aide.cap-collectif.com/article/233-proposer-france-connect-a-linscription">
              {intl.formatMessage({ id: 'learn.more' })}
            </Link>
          </Flex>
          <Button
            variantSize="big"
            variant="primary"
            onClick={() => {
              window.open(mailTo);
            }}>
            {intl.formatMessage({ id: 'contact.us' })}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  );
};

export default FranceConnectTeaserModal;
