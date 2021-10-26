// @flow
import * as React from 'react';
import { formValueSelector, reduxForm, reset, submit } from 'redux-form';
import { graphql, useFragment } from 'react-relay';
import { useDispatch, useSelector } from 'react-redux';
import { type IntlShape } from 'react-intl';
import ModalSteps from '~ds/ModalSteps/ModalSteps';
import Button from '~ds/Button/Button';
import ModalHeaderLabel from '~ds/Modal/ModalHeaderLabel';
import type { Dispatch, GlobalState } from '~/types';
import UserInviteModalStepsChooseUsers from '~/components/Admin/UserInvite/Modal/UserInviteModalStepsChooseUsers';
import UserInviteModalStepsChooseRole from '~/components/Admin/UserInvite/Modal/UserInviteModalStepsChooseRole';
import UserInviteModalStepsSendingConfirmation from '~/components/Admin/UserInvite/Modal/UserInviteModalStepsSendingConfirmation';
import type { UserInviteModalSteps_groups$key } from '~relay/UserInviteModalSteps_groups.graphql';
import InviteUserMutation, { INVITE_USERS_MAX_RESULTS } from '~/mutations/InviteUserMutation';
import { ICON_NAME } from '~ds/Icon/Icon';
import { toast } from '~ds/Toast';
import { isEmail } from '~/services/Validator';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';

const formName = 'form-user-invitation';
export const emailSeparator = ',';

const onSubmit = (values, dispatch, props) => {
  const emails = values.csvEmails.importedUsers.concat(values.inputEmails.split(emailSeparator));
  const input = {
    maxResults: INVITE_USERS_MAX_RESULTS,
    emails,
    role: values.role,
    groups: values.groups.map(group => group.value),
  };
  return InviteUserMutation.commit({
    input,
  })
    .then(() => {
      toast({
        variant: 'success',
        content: props.intl.formatMessage({ id: 'invite-sent' }, { nbInvites: emails.length }),
      });
    })
    .catch(() => {
      mutationErrorToast(props.intl);
    });
};

const asyncValidate = (values: { inputEmails: string }) => {
  if (values.inputEmails !== '') {
    const emails = values.inputEmails.split(emailSeparator);
    const formattedWrongInputEmails = emails.filter(email => !isEmail(email));
    if (formattedWrongInputEmails.length > 0) {
      return new Promise((resolve, reject) => {
        reject({ inputEmails: 'input-emails-wrong-format' });
      });
    }
    return new Promise(resolve => resolve());
  }
  return new Promise(resolve => resolve());
};

const FRAGMENT = graphql`
  fragment UserInviteModalSteps_groups on Group @relay(plural: true) {
    ...UserInviteModalStepsChooseRole_groups
  }
`;

type BeforeProps = {|
  +groups: UserInviteModalSteps_groups$key,
  +intl: IntlShape,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...BeforeProps,
|};

export const UserInviteModalSteps = ({
  groups: groupsFragment,
  intl,
  ...props
}: Props): React.Node => {
  const dispatch = useDispatch<Dispatch>();
  const groups = useFragment(FRAGMENT, groupsFragment);
  const csvEmails = useSelector((state: GlobalState) =>
    formValueSelector('form-user-invitation')(state, 'csvEmails'),
  );
  const inputEmails = useSelector((state: GlobalState) =>
    formValueSelector('form-user-invitation')(state, 'inputEmails'),
  );
  const formattedInputEmails = inputEmails.split(emailSeparator).filter(email => isEmail(email));
  const hasEmails = csvEmails.importedUsers.length > 0 || formattedInputEmails.length > 0;
  const { invalid } = props;

  return (
    <ModalSteps
      onClose={() => {
        dispatch(reset(formName));
      }}
      ariaLabel={intl.formatMessage({ id: 'invite-users-button-body' })}
      disclosure={
        <Button variant="primary" leftIcon={ICON_NAME.ADD} variantSize="small">
          {intl.formatMessage({ id: 'invite-users-button-body' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <ModalSteps.Header>
            <ModalHeaderLabel>
              {intl.formatMessage({ id: 'send-user-invitation' })}
            </ModalHeaderLabel>
          </ModalSteps.Header>
          <ModalSteps.ProgressBar />

          <ModalSteps.Body>
            <UserInviteModalStepsChooseUsers
              dispatch={dispatch}
              id="choose-users"
              label={intl.formatMessage({ id: 'select-users-to-invite' })}
              validationLabel={intl.formatMessage({ id: 'setup-invitation' })}
            />
            <UserInviteModalStepsChooseRole
              groups={groups}
              id="choose-role"
              label={intl.formatMessage({ id: 'user-invite-settings' })}
              validationLabel={intl.formatMessage({ id: 'confirm-sending-invitation' })}
            />
            <UserInviteModalStepsSendingConfirmation
              id="send-confirmation"
              validationLabel={intl.formatMessage({ id: 'send-invitation' })}
            />
          </ModalSteps.Body>

          <ModalSteps.Footer>
            <ModalSteps.Footer.BackButton variantColor="primary" />
            <ModalSteps.Footer.ContinueButton variant="primary" disabled={!hasEmails || invalid} />
            <ModalSteps.Footer.ValidationButton
              onClick={() => {
                dispatch(submit(formName));
                hide();
              }}
            />
          </ModalSteps.Footer>
        </>
      )}
    </ModalSteps>
  );
};

export default (reduxForm({
  form: formName,
  initialValues: {
    role: 'ROLE_USER',
    groups: [],
    inputEmails: '',
    csvEmails: {
      duplicateLines: [],
      importedUsers: [],
      invalidLines: [],
    },
  },
  onSubmit,
  asyncValidate,
  asyncBlurFields: ['inputEmails'],
})(UserInviteModalSteps): React.AbstractComponent<BeforeProps>);
