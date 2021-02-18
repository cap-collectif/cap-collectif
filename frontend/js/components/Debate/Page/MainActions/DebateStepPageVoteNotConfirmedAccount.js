// @flow
/** 
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import VoteView from '~/components/Ui/Vote/VoteView';
import type { GlobalState } from '~/types';
import Flex from '~ui/Primitives/Layout/Flex';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import renderInput from '~/components/Form/Field';
import { isEmail } from '~/services/Validator';
import { resendConfirmation } from '~/redux/modules/user';

type Props = {|
  ...ReduxFormFormProps,
  +positivePercentage: number,
  +isMobile?: boolean,
  +email: string,
  +isAbsolute?: boolean,
|};

type STATE = 'INITIAL' | 'SET_NEW_EMAIL' | 'NEW_EMAIL_SET';

export const formName = 'ConfirmationAccountModalForm';

type FormValues = {|
  +email: string,
|};

const validate = ({ email }: FormValues) => {
  const errors = {};

  if (!email) {
    errors.email = 'global.required';
  } else if (!isEmail(email)) {
    errors.email = 'global.constraints.email.invalid';
  }

  return errors;
};

export const DebateStepPageVoteNotConfirmedAccount = ({
  positivePercentage,
  isMobile,
  email,
  isAbsolute,
  invalid,
  pristine,
  submitting,
}: Props) => {
  const [modalState, setModalState] = React.useState<STATE>('INITIAL');

  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      {!isAbsolute && <VoteView isMobile={isMobile} positivePercentage={positivePercentage} />}
      <Flex alignItems="center">
        <span role="img" aria-label="vote" css={{ fontSize: 36, marginRight: 8 }}>
          🗳️
        </span>
        <Text color="neutral-gray.700" fontWeight="600">
          <FormattedMessage id="thanks-for-your-vote-short" />
        </Text>
      </Flex>
      <Text color="neutral-gray.700">
        <FormattedMessage id="vote-waiting-account-confirmation" />
      </Text>
      <Modal
        ariaLabel="Compte non confirmé"
        disclosure={
          <Button variant="primary" variantSize="big" mt={6}>
            <FormattedMessage id="validate-my-account" />
          </Button>
        }>
        {({ hide }) => (
          <>
            <form id={formName} onSubmit={onSubmit}>
              <Modal.Header>
                <Heading>
                  <FormattedMessage id="validate-my-account" />
                </Heading>
              </Modal.Header>
              <Modal.Body>
                {modalState === 'SET_NEW_EMAIL' && (
                  <>
                    <Field
                      name="email"
                      type="email"
                      id="modal-confirmation-email"
                      component={renderInput}
                      autoFocus
                      label={<FormattedMessage id="email.new" />}
                    />
                    <Field
                      name="password"
                      type="password"
                      id="modal-confirmation-password"
                      component={renderInput}
                      label={<FormattedMessage id="email.new" />}
                    />
                  </>
                )}
                {modalState !== 'SET_NEW_EMAIL' && (
                  <Text color="neutral-gray.700">
                    <FormattedHTMLMessage id="confirmation-link-set-to-email" values={{ email }} />
                  </Text>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Flex
                  spacing={4}
                  justifyContent={modalState === 'INITIAL' ? 'space-between' : 'flex-end'}
                  width="100%">
                  {modalState === 'INITIAL' && (
                    <Button
                      variant="link"
                      variantColor="primary"
                      onClick={() => setModalState('SET_NEW_EMAIL')}>
                      <FormattedMessage id="did-you-change-email" />
                    </Button>
                  )}
                  {modalState !== 'INITIAL' && (
                    <Button
                      variant="tertiary"
                      onClick={
                        modalState === 'NEW_EMAIL_SET' ? hide : () => setModalState('INITIAL')
                      }>
                      <Text color="neutral-gray.500">
                        <FormattedMessage
                          id={modalState === 'NEW_EMAIL_SET' ? 'global.finish' : 'global.cancel'}
                        />
                      </Text>
                    </Button>
                  )}
                  <Button
                    onClick={modalState === 'SET_NEW_EMAIL' ? onSubmit : resendConfirmation}
                    disabled={modalState === 'SET_NEW_EMAIL' && (invalid || pristine || submitting)}
                    variant="secondary"
                    variantColor="primary"
                    variantSize="small">
                    <FormattedMessage
                      id={
                        modalState === 'SET_NEW_EMAIL'
                          ? 'email.confirm.send'
                          : 'email.confirm.resend'
                      }
                    />
                  </Button>
                </Flex>
              </Modal.Footer>
            </form>
          </>
        )}
      </Modal>
    </Flex>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  email: state.user.user ? state.user.user.email : '',
});

const form = reduxForm({ validate, onSubmit, enableReinitialize: true, form: formName })(
  DebateStepPageVoteNotConfirmedAccount,
);

export default connect(mapStateToProps)(form);
*/
