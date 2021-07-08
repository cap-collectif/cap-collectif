// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl, type IntlShape } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Radio from '~ui/Form/Input/Radio/Radio';
import Tag from '~ds/Tag/Tag';
import IconMandrill from './IconMandrill.svg';
import IconMailjet from './IconMailjet.svg';
import type { SectionEmailingService_externalServiceConfiguration$key } from '~relay/SectionEmailingService_externalServiceConfiguration.graphql';
import UpdateExternalServiceConfigurationMutation from '~/mutations/UpdateExternalServiceConfigurationMutation';
import { toast } from '~ds/Toast';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import AppBox from '~ui/Primitives/AppBox';
import Section from '~ui/BackOffice/Section/Section';

type Props = {|
  +externalServiceConfiguration: SectionEmailingService_externalServiceConfiguration$key,
|};

const FRAGMENT = graphql`
  fragment SectionEmailingService_externalServiceConfiguration on ExternalServiceConfiguration {
    value
  }
`;

const updateExternalServiceConfiguration = (value: string, intl: IntlShape) =>
  UpdateExternalServiceConfigurationMutation.commit({
    input: {
      type: 'MAILER',
      value,
    },
  }).then(response => {
    if (response.updateExternalServiceConfiguration?.error) {
      mutationErrorToast(intl);
    }

    toast({
      variant: 'success',
      content: intl.formatMessage({
        id: 'global.save',
      }),
    });
  });

const SectionEmailingService = ({
  externalServiceConfiguration: externalServiceConfigurationFragment,
}: Props): React.Node => {
  const externalServiceConfiguration = useFragment(FRAGMENT, externalServiceConfigurationFragment);
  const { value } = externalServiceConfiguration;
  const intl = useIntl();

  return (
    <Section direction="row" align="stretch" justify="space-between" spacing={4}>
      <Flex direction="column" width="30%" spacing={2}>
        <Section.Title>{intl.formatMessage({ id: 'emailing-service' })}</Section.Title>
        <Section.Description>
          {intl.formatMessage({ id: 'emailing-service-explanation' })}
        </Section.Description>
      </Flex>

      <Flex direction="row" width="70%" spacing={4}>
        <Flex
          direction="row"
          align="center"
          justify="space-between"
          px={6}
          py={8}
          border="normal"
          borderRadius="normal"
          borderColor={value === 'mandrill' ? 'blue.200' : 'gray.200'}
          bg={value === 'mandrill' ? 'blue.100' : 'white'}
          flex={1}>
          <Radio
            label={<AppBox as={IconMandrill} width="100px" height="30px" />}
            id="mandrill"
            value="mandrill"
            name="mandrill"
            checked={value === 'mandrill'}
            onChange={() => updateExternalServiceConfiguration('mandrill', intl)}
          />
          {value === 'mandrill' && (
            <Tag variant="blue" interactive={false}>
              {intl.formatMessage({ id: 'global.active' })}
            </Tag>
          )}
        </Flex>

        <Flex
          direction="row"
          align="center"
          justify="space-between"
          px={6}
          py={8}
          border="normal"
          borderRadius="normal"
          borderColor={value === 'mailjet' ? 'blue.200' : 'gray.200'}
          bg={value === 'mailjet' ? 'blue.100' : 'white'}
          flex={1}>
          <Radio
            label={<AppBox as={IconMailjet} width="100px" height="30px" />}
            id="mailjet"
            value="mailjet"
            name="mailjet"
            checked={value === 'mailjet'}
            onChange={() => updateExternalServiceConfiguration('mailjet', intl)}
          />
          {value === 'mailjet' && (
            <Tag variant="blue" interactive={false}>
              {intl.formatMessage({ id: 'global.active' })}
            </Tag>
          )}
        </Flex>
      </Flex>
    </Section>
  );
};

export default SectionEmailingService;
