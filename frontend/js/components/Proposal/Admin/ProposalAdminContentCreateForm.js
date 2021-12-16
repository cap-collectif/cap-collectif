// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  submit,
  SubmissionError,
  isPristine,
  isDirty,
  isInvalid,
  isSubmitting,
  hasSubmitFailed,
} from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { useAnalytics } from 'use-analytics';
import css from '@styled-system/css';
import styled, { type StyledComponent } from 'styled-components';
import moment from 'moment';
import type { Dispatch, GlobalState, Uuid } from '~/types';
import { styleGuideColors, colors } from '~/utils/colors';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import type { ProposalAdminContentCreateForm_proposalForm } from '~relay/ProposalAdminContentCreateForm_proposalForm.graphql';
import Help from '~ui/Form/Help/Help';
import ProposalFormLegacy, {
  formName,
  type FormValues,
  memoizeAvailableQuestions,
  type Props as ProposalFormProps,
} from '~/components/Proposal/Form/ProposalFormLegacy';
import ConfirmModal from '~ds/Modal/ConfirmModal';
import Button from '~ds/Button/Button';
import { getContributionsPath } from '~/components/Admin/Project/ProjectAdminContributions/IndexContributions/IndexContributions';
import { getProjectAdminPath } from '~/components/Admin/Project/ProjectAdminPage.utils';
import { ICON_NAME as ICON_NAME_DS } from '~ds/Icon/Icon';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import { validateProposalContent } from './ProposalAdminContentForm';
import CreateProposalFromBackOfficeMutation from '~/mutations/CreateProposalFromBackOfficeMutation';
import { toast } from '~ds/Toast';
import AlertForm from '~/components/Alert/AlertForm';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';

type RelayProps = {|
  +proposalForm: ProposalAdminContentCreateForm_proposalForm,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  dirty: boolean,
  dispatch: Dispatch,
  projectType: string,
|};

const FormContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-size: 14px;

  .form-group > label > *, .form-group > label {
      font-weight: 400;
      font-size: 14px;
      color: ${styleGuideColors.gray900};
    }
  }
  
  .bo_width_747 {
    .form-group {
      max-width: 747px;
    }
  }
    
  .bo_width_200 {
    .form-group {
      max-width: 200px;
    }
  } 
   
 .bo_width_560 {
    .form-group {
      max-width: 560px;
    }
  }
  .form-group {
    .opinion__text {
      .Linkify {
        color: ${styleGuideColors.gray700};
      }
    }
  }

  .react-select-container {
    z-index: 999;
  }
`;

export type BackOfficeFormValues = {|
  ...FormValues,
  author: { value: Uuid, label: string },
  publishedAt: string,
|};

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const onSubmit = (
  values: BackOfficeFormValues,
  dispatch: Dispatch,
  { proposalForm, features, intl, onSubmitFailed, errorCount = 0 }: ProposalFormProps,
) => {
  const data = {
    title: values.title,
    summary: values.summary,
    body: values.body,
    address: values.address,
    theme: values.theme,
    category: values.category,
    district: values.district,
    tipsmeeeId: values.tipsmeeeId,
    responses: formatSubmitResponses(values.responses, proposalForm.questions),
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
    twitterUrl: values.twitterUrl,
    facebookUrl: values.facebookUrl,
    youtubeUrl: values.youtubeUrl,
    webPageUrl: values.webPageUrl,
    instagramUrl: values.instagramUrl,
    linkedInUrl: values.linkedInUrl,
  };

  if (!proposalForm.step) {
    return;
  }
  const availableQuestions = memoizeAvailableQuestions.cache.get('availableQuestions');
  const responsesError = validateProposalContent(
    values,
    proposalForm,
    features,
    intl,
    false,
    availableQuestions,
    true,
    true,
  );

  const errors = {};
  const isEmptyArray = responsesError.responses ? responsesError.responses.filter(Boolean) : [];
  if (isEmptyArray && isEmptyArray.length) {
    errors.responses = responsesError.responses;
    throw new SubmissionError(errors);
  }
  return CreateProposalFromBackOfficeMutation.commit({
    input: {
      ...data,
      proposalFormId: proposalForm.id,
      author: values.author.value,
      publishedAt: moment(values.publishedAt, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    },
  })
    .then(response => {
      if (
        !response.createProposalFromBackOffice ||
        !response.createProposalFromBackOffice.proposal
      ) {
        onSubmitFailed();
        toast({
          variant: 'danger',
          position: 'top',
          content: intl.formatHTMLMessage({
            id: errorCount < 1 ? 'opinion.request.failure' : 'error.persist.try.again',
          }),
        });
        throw new Error('Mutation "createProposalFromBackOffice" failed.');
      }
      window.removeEventListener('beforeunload', onUnload);

      const backOfficeRedirect =
        proposalForm.step?.id && proposalForm.step?.slug && proposalForm.step?.project?._id
          ? getContributionsPath(
              getProjectAdminPath(proposalForm.step?.project?._id || '', 'CONTRIBUTIONS'),
              'CollectStep',
              proposalForm.step?.id || '',
              proposalForm.step?.slug || '',
            )
          : document.referrer;

      const redirectUrl =
        document.referrer.indexOf(backOfficeRedirect) === 0
          ? document.referrer
          : backOfficeRedirect;
      toast({
        variant: 'success',
        position: 'top',
        content: intl.formatHTMLMessage({ id: 'proposal-create' }),
      });
      window.location.href = redirectUrl;
    })
    .catch(() => {
      onSubmitFailed();
      toast({
        variant: 'danger',
        position: 'top',
        content: intl.formatHTMLMessage({
          id: errorCount < 1 ? 'opinion.request.failure' : 'error.persist.try.again',
        }),
      });
    });
};

export const ProposalAdminContentCreateForm = ({
  proposalForm,
  pristine,
  submitting,
  dispatch,
  dirty,
  invalid,
  submitFailed,
}: Props) => {
  const { track } = useAnalytics();
  const intl = useIntl();
  const [errorCount, setErrorCount] = React.useState<number>(0);
  const { isLoading, startLoading, stopLoading } = useLoadingMachine();

  const confirmModal = (disclosure: React$Element<any>): React$Element<any> => {
    return (
      <ConfirmModal
        css={css({
          '.confirm-modal-body': {
            borderTop: `solid 1px ${colors.borderColor}`,
            borderBottom: `solid 1px ${colors.borderColor}`,
            padding: '24px',
            lineHeight: '24px',
          },
          '.confirm-modal-header': {
            padding: '24px',
          },
          '.confirm-modal-footer': {
            padding: '24px',
          },
        })}
        onConfirm={() => {
          setTimeout(() => {
            window.location.href =
              proposalForm && proposalForm.step?.project?._id && proposalForm.step?.slug
                ? getContributionsPath(
                    getProjectAdminPath(proposalForm.step?.project?._id || '', 'CONTRIBUTIONS'),
                    'CollectStep',
                    proposalForm.step?.id || '',
                    proposalForm.step?.slug || '',
                  )
                : document.referrer;
          }, 2000);
        }}
        options={{
          confirmButton: {
            content: intl.formatMessage({ id: 'global-exit' }),
            props: {
              variantSize: 'small',
            },
          },
          cancelButton: {
            content: intl.formatMessage({ id: 'global.cancel' }),
            props: {
              variant: 'secondary',
              variantColor: 'hierarchy',
              variantSize: 'small',
            },
          },
        }}
        title={intl.formatMessage({ id: 'quit-without-saving' })}
        body={intl.formatMessage({ id: 'information-should-not-be-saved' })}
        disclosure={disclosure}
        ariaLabel="global.confirm"
        width={['100%', '325px']}
      />
    );
  };
  return (
    <Flex m={6} direction="column">
      <AppBox p={6} backgroundColor={styleGuideColors.white}>
        {dirty ? (
          confirmModal(
            <Button variant="tertiary" leftIcon={ICON_NAME_DS.LONG_ARROW_LEFT} size="small" mb={4}>
              {intl.formatMessage({ id: 'global.back' })}
            </Button>,
          )
        ) : (
          <Button
            variant="tertiary"
            onClick={() => {
              window.location.href = document.referrer;
            }}
            leftIcon={ICON_NAME_DS.LONG_ARROW_LEFT}
            size="small"
            mb={4}>
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
        )}
        <AppBox mb={6}>
          <Heading as="h3" color={styleGuideColors.blue800}>
            {intl.formatMessage({ id: 'new-proposal' })}
          </Heading>
          <Help>{intl.formatMessage({ id: 'new-proposal-help-text' })}</Help>
        </AppBox>
        <FormContainer>
          <ProposalFormLegacy
            proposalForm={proposalForm}
            proposal={null}
            isBackOfficeInput
            onSubmit={onSubmit}
            errorCount={errorCount}
            onSubmitFailed={() => {
              setErrorCount(errorCount + 1);
            }}
          />
        </FormContainer>
      </AppBox>
      <Flex
        mt={6}
        maxWidth="570px"
        spacing={6}
        css={css({
          '#confirm-proposal-create': {
            maxWidth: '170px',
          },
        })}>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="medium"
          isLoading={isLoading}
          id="confirm-proposal-create"
          disabled={pristine || submitting}
          onClick={() => {
            if (!invalid) {
              startLoading();
            }
            track('submit_proposal_click', {
              step_title: proposalForm.step?.title || '',
              step_url: proposalForm.step?.url || '',
              project_title: proposalForm.step?.project?.title || '',
            });
            dispatch(submit(formName));
            if (submitFailed) {
              stopLoading();
            }
          }}>
          {intl.formatMessage({ id: isLoading ? 'global.creation' : 'global.create' })}
        </Button>
        {dirty ? (
          confirmModal(
            <Button
              width={['100%', 'auto']}
              justifyContent={['center', 'flex-start']}
              variantSize="medium"
              variant="secondary"
              variantColor="primary">
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>,
          )
        ) : (
          <Button
            width={['100%', 'auto']}
            justifyContent={['center', 'flex-start']}
            variantSize="medium"
            variant="secondary"
            variantColor="primary"
            onClick={() => {
              if (
                proposalForm.step?.id &&
                proposalForm.step?.slug &&
                proposalForm.step?.project?._id
              ) {
                window.location.href = getContributionsPath(
                  getProjectAdminPath(proposalForm.step?.project?._id || '', 'CONTRIBUTIONS'),
                  'CollectStep',
                  proposalForm.step?.id || '',
                  proposalForm.step?.slug || '',
                );
              } else {
                window.location.href = window.document.referrer;
              }
            }}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
        )}
        <AlertForm invalid={submitFailed && invalid} />
      </Flex>
    </Flex>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  submitFailed: hasSubmitFailed(formName)(state),
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
  dirty: isDirty(formName)(state),
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalAdminContentCreateForm);

export default createFragmentContainer(container, {
  proposalForm: graphql`
    fragment ProposalAdminContentCreateForm_proposalForm on ProposalForm {
      id
      step {
        title
        url
        slug
        id
        project {
          _id
          title
        }
      }
      ...ProposalFormLegacy_proposalForm
    }
  `,
});
