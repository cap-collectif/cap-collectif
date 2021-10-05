// @flow
import * as React from 'react';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import Text from '~ui/Primitives/Text';
import Accordion from '~ds/Accordion';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';

const ModalDNSSupplier = (): React.Node => {
  const intl = useIntl();

  return (
    <Accordion defaultAccordion="accordion-connection">
      <Accordion.Item id="accordion-connection">
        <Accordion.Button>
          <Text color="gray.900" fontSize={4}>
            {`1. ${intl.formatMessage({ id: 'connect-to-your-dns-supplier' })}`}
          </Text>
        </Accordion.Button>
        <Accordion.Panel>
          <Text color="gray.500" fontSize={3}>
            {intl.formatMessage({ id: 'if-domain-host-to' })}
          </Text>

          <Flex as="ul" direction="column">
            <AppBox as="li">
              <FormattedHTMLMessage id="connect-here-for-ovh" />
            </AppBox>
            <AppBox as="li">
              <FormattedHTMLMessage id="connect-here-for-gandi" />
            </AppBox>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="accordion-parameters">
        <Accordion.Button>
          <Text color="gray.900" fontSize={4}>
            {`2. ${intl.formatMessage({ id: 'go-to-dns-parameters' })}`}
          </Text>
        </Accordion.Button>
        <Accordion.Panel>
          <Text color="gray.700" fontSize={3}>
            <FormattedHTMLMessage id="instructions-access-dns-parameters" />
          </Text>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default ModalDNSSupplier;
