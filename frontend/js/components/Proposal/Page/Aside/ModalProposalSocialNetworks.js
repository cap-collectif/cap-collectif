// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Field, reduxForm, SubmissionError, submit } from 'redux-form';
import css from '@styled-system/css';
import {
  Box,
  Text,
  Button,
  ButtonGroup,
  Heading,
  toast,
  Modal,
  CapUIModalSize,
} from '@cap-collectif/ui';
import type { Dispatch } from '~/types';
import ResetCss from '~/utils/ResetCss';
import type {
  ModalProposalSocialNetworks_proposal$key,
  ModalProposalSocialNetworks_proposal,
} from '~relay/ModalProposalSocialNetworks_proposal.graphql';
import colors from '~/utils/colors';
import component from '~/components/Form/Field';
import UpdateProposalSocialNetworksMutation from '~/mutations/UpdateProposalSocialNetworksMutation';
import { isUrl } from '~/services/Validator';
import {
  fbRegEx,
  instagramRegEx,
  linkedInRegEx,
  twitterRegEx,
  youtubeRegEx,
} from '~/components/Utils/SocialNetworkRegexUtils';
import AlertForm from '~/components/Alert/AlertForm';

const formName = 'proposal-socialNetworks';

const FRAGMENT = graphql`
  fragment ModalProposalSocialNetworks_proposal on Proposal {
    twitterUrl
    webPageUrl
    facebookUrl
    instagramUrl
    linkedInUrl
    youtubeUrl
    isProposalUsingAnySocialNetworks
    form {
      usingFacebook
      usingWebPage
      usingTwitter
      usingInstagram
      usingYoutube
      usingLinkedIn
    }
  }
`;

type FragmentProps = {|
  +proposal: ModalProposalSocialNetworks_proposal$key,
  +proposalType: ModalProposalSocialNetworks_proposal,
|};

type FormValues = {|
  twitterUrl: ?string,
  facebookUrl: ?string,
  youtubeUrl: ?string,
  webPageUrl: ?string,
  instagramUrl: ?string,
  linkedInUrl: ?string,
|};

type Props = {|
  ...FragmentProps,
  ...ReduxFormFormProps,
  +dispatch: Dispatch,
  +show: boolean,
  +onClose: () => void,
  +initialValues: FormValues,
  +proposalId: string,
  +isAuthenticated: boolean,
|};

const onSubmit = (
  values: FormValues,
  _dispatch,
  { proposalId, proposalType, isAuthenticated }: Props,
) => {
  const data = {
    twitterUrl: values.twitterUrl || null,
    facebookUrl: values.facebookUrl || null,
    youtubeUrl: values.youtubeUrl || null,
    webPageUrl: values.webPageUrl || null,
    instagramUrl: values.instagramUrl || null,
    linkedInUrl: values.linkedInUrl || null,
    proposalId,
  };
  return UpdateProposalSocialNetworksMutation.commit({
    input: data,
    isAuthenticated,
  })
    .then(response => {
      if (
        !response.updateProposalSocialNetworks ||
        !response.updateProposalSocialNetworks.proposal
      ) {
        throw new Error('Mutation "UpdateProposalSocialNetworksMutation" failed.');
      }
      toast({
        variant: 'success',
        content: (
          <FormattedMessage
            id={
              proposalType.isProposalUsingAnySocialNetworks
                ? 'external-links-edited'
                : 'external-links-published'
            }
          />
        ),
        duration: 2500,
      });
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: <FormattedMessage id="error-download-timeout" />,
        duration: 2500,
      });
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues) => {
  const errors = {};
  if (values.webPageUrl && !isUrl(values.webPageUrl)) {
    errors.webPageUrl = 'error-webPage-url';
  }

  if (values.facebookUrl && (!values.facebookUrl.match(fbRegEx) || !isUrl(values.facebookUrl))) {
    errors.facebookUrl = {
      id: 'error-invalid-facebook-url',
    };
  }

  if (values.twitterUrl && (!values.twitterUrl.match(twitterRegEx) || !isUrl(values.twitterUrl))) {
    errors.twitterUrl = {
      id: 'error-invalid-socialNetwork-url',
      values: { SocialNetworkName: 'Twitter' },
    };
  }

  if (
    values.instagramUrl &&
    (!values.instagramUrl.match(instagramRegEx) || !isUrl(values.instagramUrl))
  ) {
    errors.instagramUrl = {
      id: 'error-invalid-socialNetwork-url',
      values: { SocialNetworkName: 'Instagram' },
    };
  }

  if (
    values.linkedInUrl &&
    (!values.linkedInUrl.match(linkedInRegEx) || !isUrl(values.linkedInUrl))
  ) {
    errors.linkedInUrl = {
      id: 'error-invalid-socialNetwork-url',
      values: { SocialNetworkName: 'LinkedIn' },
    };
  }
  if (values.youtubeUrl && (!values.youtubeUrl.match(youtubeRegEx) || !isUrl(values.youtubeUrl))) {
    errors.youtubeUrl = {
      id: 'error-invalid-youtube-url',
    };
  }

  return errors;
};

const ModalProposalSocialNetworks = ({
  show,
  onClose,
  proposal: proposalFragment,
  dispatch,
  submitting,
  pristine,
  invalid,
  valid,
  submitFailed,
}: Props): React.Node => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  const intl = useIntl();
  return (
    <Modal
      baseId="proposal-social-networks-modal"
      size={CapUIModalSize.Md}
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'global.visitor.dynamic' })}
      width={['100%', '720px']}>
      <ResetCss>
        <Modal.Header paddingY={6} borderBottom={`1px solid ${colors.borderColor}`}>
          <Text
            fontSize="11px"
            color="gray.500"
            lineHeight="16px"
            fontWeight="bold"
            css={css({
              span: {
                textTransform: 'uppercase',
              },
            })}>
            <span>
              {proposal.isProposalUsingAnySocialNetworks
                ? intl.formatMessage({ id: 'edit-external-links' })
                : intl.formatMessage({ id: 'add-external-links' })}
            </span>
          </Text>
          <Heading as="h4" color="blue.900">
            {intl.formatMessage({ id: 'find-us' })}
          </Heading>
        </Modal.Header>
      </ResetCss>
      <Modal.Body spacing={5}>
        <form id={formName}>
          <Box
            backgroundColor="white"
            mb="48px"
            css={css({
              '.form-group label': {
                fontWeight: '400',
                fontSize: '14px',
                color: 'gray.900',
              },
            })}>
            {proposal.form.usingWebPage && (
              <Field
                id="proposal_wep_page"
                name="webPageUrl"
                placeholder={intl.formatMessage({ id: 'your-url' })}
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'form.label_website' })}
              />
            )}
            {proposal.form.usingTwitter && (
              <Field
                id="proposal_twitter"
                name="twitterUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'share.twitter' })}
                placeholder="https://twitter.com/pseudo"
              />
            )}
            {proposal.form.usingFacebook && (
              <Field
                id="proposal_facebook"
                name="facebookUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'share.facebook' })}
                placeholder="https://facebook.com/pseudo"
              />
            )}
            {proposal.form.usingInstagram && (
              <Field
                id="proposal_instagram"
                name="instagramUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'instagram' })}
                placeholder="https://instagram.com/pseudo"
              />
            )}
            {proposal.form.usingLinkedIn && (
              <Field
                id="proposal_linkedin"
                name="linkedInUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'share.linkedin' })}
                placeholder="https://linkedin.com/in/pseudo"
              />
            )}
            {proposal.form.usingYoutube && (
              <Field
                id="proposal_youtube"
                name="youtubeUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'youtube' })}
                placeholder="https://youtube.com/channel/pseudo"
              />
            )}
          </Box>
        </form>
      </Modal.Body>
      <Modal.Footer
        as="div"
        display="flex"
        flex={1}
        justifyContent="space-between"
        py={4}
        px={6}
        align={['stretch', 'center']}
        direction={['column', 'row']}
        borderTop="normal"
        borderColor="gray.200">
        <AlertForm
          valid={valid}
          invalid={invalid}
          submitFailed={submitFailed}
          submitting={submitting}
        />
        <ButtonGroup>
          <Button
            variant="secondary"
            variantSize="big"
            variantColor="primary"
            justifyContent="center"
            disabled={submitting}
            onClick={onClose}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            disabled={pristine || submitting || invalid}
            isLoading={submitting}
            justifyContent={['center', 'flex-start']}
            onClick={() => {
              dispatch(submit(formName));
              setTimeout(() => {
                onClose();
              }, 2000);
            }}>
            {intl.formatMessage({ id: submitting ? 'global.publication' : 'global.publish' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
};

export default reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ModalProposalSocialNetworks);
