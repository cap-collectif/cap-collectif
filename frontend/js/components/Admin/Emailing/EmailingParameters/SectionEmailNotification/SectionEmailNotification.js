// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Field, reduxForm } from 'redux-form';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Section from '~ui/BackOffice/Section/Section';
import component from '~/components/Form/Field';
import Link from '~ds/Link/Link';
import ModalAddEmailSender from '../ModalAddEmailSender/ModalAddEmailSender';

const FieldContainer = styled(Flex)`
  .form-group {
    width: 280px;
  }
`;

type Props = {|
  initialValues: {|
    +'recipient-email': string,
    +'sender-email': string,
    +'sender-name': string,
  |},
|};

const formName = 'form-email-notification';

const SectionEmailNotification = (): React.Node => {
  const intl = useIntl();

  return (
    <Section direction="row" align="stretch" justify="space-between" spacing={4}>
      <Flex direction="column" width="30%" spacing={2}>
        <Section.Title>{intl.formatMessage({ id: 'notification-email' })}</Section.Title>
        <Section.Description>
          {intl.formatMessage({ id: 'notification-email-explanation' })}{' '}
          <Link href="/">{intl.formatMessage({ id: 'learn.more' })}</Link>
        </Section.Description>
      </Flex>

      <FieldContainer direction="column" width="70%" align="flex-start">
        <Field
          label={intl.formatMessage({ id: 'recipient-email' })}
          id="recipient-email"
          name="recipient-email"
          type="text"
          component={component}
          placeholder="global.placeholder.email"
        />

        <Flex direction="row" spacing={4}>
          <Field
            label={intl.formatMessage({ id: 'sender-email' })}
            id="sender-email"
            name="sender-email"
            type="text"
            component={component}
            placeholder="global.placeholder.email"
          />

          <Field
            label={intl.formatMessage({ id: 'sender-name' })}
            id="sender-name"
            name="sender-name"
            type="text"
            component={component}
            placeholder="global.placeholder.name"
          />
        </Flex>
        <ModalAddEmailSender initialValues={{ email: 'test@cap-collectif.com' }} />
      </FieldContainer>
    </Section>
  );
};

const SectionEmailNotificationForm = (reduxForm({
  form: formName,
})(SectionEmailNotification): React.AbstractComponent<Props>);

export default SectionEmailNotificationForm;
