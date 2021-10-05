// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import debounce from 'debounce-promise';
import { Field, reduxForm } from 'redux-form';
import { useIntl, type IntlShape } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Section from '~ui/BackOffice/Section/Section';
import component from '~/components/Form/Field';
import ModalAddEmailSender from '../ModalAddEmailSender/ModalAddEmailSender';
import select from '~/components/Form/Select';
import type { SectionEmailNotification_query$key } from '~relay/SectionEmailNotification_query.graphql';
import { toast } from '~ds/Toast';
import SelectSenderEmailMutation from '~/mutations/SelectSenderEmailMutation';
import UpdateSiteParameterMutation from '~/mutations/UpdateSiteParameterMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import type { UpdateSiteParameterKeyname } from '~relay/UpdateSiteParameterMutation.graphql';

const FieldContainer = styled(Flex)`
  .form-group {
    width: 280px;
  }
`;

type FormValues = {|
  +'recipient-email': string,
  +'sender-email': string,
  +'sender-name': string,
|};

type BeforeProps = {|
  initialValues: FormValues,
  query: SectionEmailNotification_query$key,
|};

type Props = {|
  ...BeforeProps,
  ...ReduxFormFormProps,
|};

const FRAGMENT = graphql`
  fragment SectionEmailNotification_query on Query {
    senderEmails {
      id
      address
    }
    senderEmailDomains {
      value
      spfValidation
      dkimValidation
      ...ModalAddEmailSender_senderEmailDomains
    }
  }
`;

const formName = 'form-email-notification';

const updateSenderEmail = (senderEmailId: string, intl: IntlShape) => {
  return SelectSenderEmailMutation.commit({
    input: {
      senderEmail: senderEmailId,
    },
  })
    .then(response => {
      if (response.selectSenderEmail?.errorCode) {
        mutationErrorToast(intl);
      } else {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'global.save' }),
        });
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const updateSiteParameter = (value: string, type: UpdateSiteParameterKeyname, intl: IntlShape) => {
  return debounce(
    UpdateSiteParameterMutation.commit({
      input: {
        keyname: type,
        value,
      },
    })
      .then(response => {
        if (response.updateSiteParameter?.errorCode === 'INVALID_VALUE') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({ id: 'global.constraints.email.invalid' }),
          });
        } else if (response.updateSiteParameter?.errorCode) {
          mutationErrorToast(intl);
        } else {
          toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'global.save' }),
          });
        }
      })
      .catch(() => {
        mutationErrorToast(intl);
      }),
    1000,
  );
};

const handleDebounceChangeSiteParameter = debounce(updateSiteParameter, 2000);

const SectionEmailNotification = ({ query: queryFragment }: Props): React.Node => {
  const query = useFragment(FRAGMENT, queryFragment);
  const { senderEmails, senderEmailDomains } = query;
  const intl = useIntl();
  const defaultEmailDomain =
    senderEmailDomains.find(
      senderEmailDomain => senderEmailDomain.spfValidation && senderEmailDomain.dkimValidation,
    )?.value || '';

  return (
    <Section direction="row" align="stretch" justify="space-between" spacing={4}>
      <Flex direction="column" width="30%" spacing={2}>
        <Section.Title>{intl.formatMessage({ id: 'notification-email' })}</Section.Title>
        <Section.Description>
          {intl.formatMessage({ id: 'notification-email-explanation' })}
        </Section.Description>
      </Flex>

      <FieldContainer direction="column" width="70%" align="flex-start">
        <Field
          type="text"
          label={intl.formatMessage({ id: 'recipient-email' })}
          id="recipient-email"
          name="recipient-email"
          component={component}
          placeholder="global.placeholder.email"
          onChange={(e, value) => handleDebounceChangeSiteParameter(value, 'RECEIVE_ADDRESS', intl)}
        />

        <Flex direction="row" spacing={4}>
          <Field
            id="sender-email"
            name="sender-email"
            type="select"
            clearable={false}
            component={select}
            label={intl.formatMessage({ id: 'sender-email' })}
            placeholder="global.placeholder.email"
            options={senderEmails.map(senderEmail => ({
              value: senderEmail.id,
              label: senderEmail.address,
            }))}
            onChange={(e, value: string) => updateSenderEmail(value, intl)}
          />

          <Field
            type="text"
            label={intl.formatMessage({ id: 'sender-name' })}
            id="sender-name"
            name="sender-name"
            component={component}
            placeholder="global.placeholder.name"
            onChange={(e, value) => handleDebounceChangeSiteParameter(value, 'SEND_NAME', intl)}
          />
        </Flex>

        <ModalAddEmailSender
          initialValues={{
            'email-domain': defaultEmailDomain,
          }}
          senderEmailDomains={senderEmailDomains}
          intl={intl}
        />
      </FieldContainer>
    </Section>
  );
};

const SectionEmailNotificationForm = (reduxForm({
  form: formName,
})(SectionEmailNotification): React.AbstractComponent<BeforeProps>);

export default SectionEmailNotificationForm;
