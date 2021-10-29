// @flow
import * as React from 'react';
import { formValueSelector, reduxForm, reset, submit } from 'redux-form';
import { fetchQuery, graphql, useFragment } from 'react-relay';
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
import environment from '~/createRelayEnvironment';

const formName = 'form-user-invitation';
const maxEmails = 5;
export const emailSeparator = ',';

const USER_FETCH_QUERY = graphql`
  query UserInviteModalStepsAvailabilitySearchQuery($emails: [String!]!) {
    userInvitationsAvailabilitySearch(emails: $emails) {
      totalCount
      edges {
        node {
          email
          availableForUser
          availableForInvitation
        }
      }
    }
  }
`;

const onSubmit = (values, dispatch, props) => {
  const emails = values.csvEmails.importedUsers.concat(values.inputEmails.split(emailSeparator));
  const input = {
    maxResults: INVITE_USERS_MAX_RESULTS,
    emails,
    role: values.role,
    groups: values.groups.map(group => group.value),
    message: values.message,
    redirectionUrl: values.redirectionUrl,
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

const asyncValidate = (values: { inputEmails: string, redirectionUrl: string }) => {
  if (values.inputEmails !== '') {
    const emails = values.inputEmails.split(emailSeparator);
    const formattedWrongInputEmails = emails.filter(email => !isEmail(email));
    if (formattedWrongInputEmails.length > 0) {
      return new Promise((resolve, reject) => {
        reject({ inputEmails: 'input-emails-wrong-format' });
      });
    }

    if (emails.length > maxEmails) {
      return new Promise((resolve, reject) => {
        reject({ inputEmails: 'input-emails-max-reached' });
      });
    }

    const formattedInputEmails = emails.filter(email => isEmail(email));
    if (formattedInputEmails.length > 0) {
      return new Promise((resolve, reject) => {
        fetchQuery(environment, USER_FETCH_QUERY, { emails: formattedInputEmails }).subscribe({
          next: response => {
            const invitationsAvailabilitiesData = response.userInvitationsAvailabilitySearch;
            if (invitationsAvailabilitiesData.totalCount > 0) {
              const duplicateEmails = invitationsAvailabilitiesData.edges.filter(
                item => !item.node.availableForUser,
              );
              if (duplicateEmails.length > 0) {
                if (emails.length > 1 && duplicateEmails.length === emails.length) {
                  reject({ inputEmails: 'input-email-already-used' });
                }

                if (
                  (emails.length > 0 && duplicateEmails.length === 1) ||
                  (emails.length > 0 && duplicateEmails.length < emails.length)
                ) {
                  reject({
                    _inputEmails: {
                      data: duplicateEmails.map(item => item.node.email),
                    },
                  });
                }
              }
            }
            resolve();
          },
        });
      });
    }
  }

  if (values.redirectionUrl !== '') {
    const hostname = new RegExp(window.location.hostname);
    if (!hostname.test(values.redirectionUrl)) {
      return new Promise((resolve, reject) => {
        reject({ redirectionUrl: 'input-redirection-url-match-error' });
      });
    }
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
            <ModalSteps.Footer.BackButton />
            <ModalSteps.Footer.ContinueButton disabled={!hasEmails || invalid} />
            <ModalSteps.Footer.ValidationButton
              disabled={invalid}
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
    message: '',
    redirectionUrl: '',
  },
  onSubmit,
  asyncValidate,
  asyncBlurFields: ['inputEmails', 'redirectionUrl'],
})(UserInviteModalSteps): React.AbstractComponent<BeforeProps>);
