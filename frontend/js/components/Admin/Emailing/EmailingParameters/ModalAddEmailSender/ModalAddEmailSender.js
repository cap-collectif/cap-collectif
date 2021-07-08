// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import Heading from '~ui/Primitives/Heading';
import component from '~/components/Form/Field';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';

const formName = 'form-email-sender';

type Props = {|
  +initialValues: {|
    +email: string,
  |},
|};

const ModalAddEmailSender = () => {
  const intl = useIntl();

  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'add-sender-email-address' })}
      disclosure={
        <Button variant="tertiary" variantColor="primary">
          {intl.formatMessage({ id: 'global.add' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>
              {intl.formatMessage({ id: 'notification-email' })}
            </Modal.Header.Label>
            <Heading>{intl.formatMessage({ id: 'add-sender-email-address' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Field
              label={intl.formatMessage({ id: 'share.mail' })}
              id="email"
              name="email"
              type="text"
              component={component}
              placeholder="global.placeholder.email"
              addonAfter="cap-co.com"
            />
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variant="tertiary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button variantSize="big" variant="primary" variantColor="primary">
                {intl.formatMessage({ id: 'global.add' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

const ModalAddEmailSenderForm = (reduxForm({
  form: formName,
})(ModalAddEmailSender): React.AbstractComponent<Props>);

export default ModalAddEmailSenderForm;
