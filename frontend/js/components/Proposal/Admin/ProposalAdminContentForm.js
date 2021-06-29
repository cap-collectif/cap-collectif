// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import {
  Field,
  FieldArray,
  formValueSelector,
  reduxForm,
  SubmissionError,
  submit,
} from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ButtonToolbar, Glyphicon, ListGroup, ListGroupItem, Panel } from 'react-bootstrap';
import memoize from 'lodash/memoize';
import styled, { type StyledComponent } from 'styled-components';
import { isUrl } from '~/services/Validator';
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation';
import UpdateProposalFusionMutation from '~/mutations/UpdateProposalFusionMutation';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import ProposalFusionEditModal from './ProposalFusionEditModal';
import type { ProposalAdminContentForm_proposal } from '~relay/ProposalAdminContentForm_proposal.graphql';
import type { ProposalForm_proposalForm } from '~relay/ProposalForm_proposalForm.graphql';
import type { FormValues as FrontendFormValues } from '../Form/ProposalForm';
import type { Dispatch, FeatureToggles, GlobalState, Uuid } from '~/types';
import UserListField from '../../Admin/Field/UserListField';
import SubmitButton from '~/components/Form/SubmitButton';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import validateResponses from '~/utils/form/validateResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import warnResponses from '~/utils/form/warnResponses';
import renderResponses from '~/components/Form/RenderResponses';
import type { AddressComplete } from '~/components/Form/Address/Address.type';
import ProposalRevision from '~/shared/ProposalRevision/ProposalRevision';
import colors, { styleGuideColors } from '~/utils/colors';
import { pxToRem } from '~/utils/styles/mixins';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Card from '~ds/Card/Card';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import {
  fbRegEx,
  linkedInRegEx,
  twitterRegEx,
  instagramRegEx,
  youtubeRegEx,
} from '~/components/Utils/SocialNetworkRegexUtils';

type FormValues = {|
  media: ?{ id: Uuid },
  responses: ResponsesInReduxForm,
  draft: boolean,
  title?: ?string,
  body?: ?string,
  summary?: ?string,
  author?: { value: Uuid, label: string },
  theme?: ?Uuid,
  addressText?: ?string,
  category?: ?Uuid,
  district?: ?Uuid,
  address?: ?string,
  likers: [{ value: Uuid, label: string }],
  estimation: ?number,
  webPageUrl: ?string,
  facebookUrl: ?string,
  twitterUrl: ?string,
  instagramUrl: ?string,
  linkedInUrl: ?string,
  youtubeUrl: ?string,
|};

type RelayProps = {|
  +proposal: ProposalAdminContentForm_proposal,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  +themes: Array<{ id: Uuid, title: string }>,
  +features: FeatureToggles,
  +intl: IntlShape,
  +isAdmin: boolean,
  +responses: ResponsesInReduxForm,
  +dispatch: Dispatch,
|};

const formName = 'proposal-admin-edit';

const RevisionButton = styled(Button)`
  background: transparent;
  border: 1px solid ${styleGuideColors.blue500};
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: ${pxToRem(14)};
  color: ${styleGuideColors.blue500};
  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: ${styleGuideColors.blue500};
    border: 1px solid ${styleGuideColors.blue500};
    background: transparent;
  }
`;

const ExternaLinksCard: StyledComponent<{}, {}, typeof Card> = styled(Card)`
  .form-group {
    max-width: 400px;
    margin-top: 24px;
  }

  label {
    span {
      font-weight: 400;
      font-size: 14px;
      color: ${styleGuideColors.gray900};
    }
  }
`;

const NotationCard: StyledComponent<{}, {}, typeof Card> = styled(Card)`
  .form-fields,
  #likers,
  #proposal_estimation {
    max-width: 350px;
  }

  .form-group {
    margin: 0;
  }

  padding-top: 24px;
  padding-bottom: 0;
  .likers-fields {
    margin-bottom: 24px;
  }

  label {
    span {
      font-weight: 400;
      font-size: 14px;
      color: ${styleGuideColors.gray900};
    }

    margin-top: 24px;
    margin-bottom: 4px !important;
  }

  a {
    text-transform: uppercase;
    color: ${styleGuideColors.blue500};
    line-height: 16px;
    vertical-align: super;
  }
`;

const onSubmit = (
  values: FormValues,
  dispatch: Dispatch,
  { proposal, isAdmin, features }: Props,
) => {
  const input = {
    title: values.title,
    summary: values.summary,
    body: values.body,
    address: values.address,
    theme: values.theme,
    category: values.category,
    district: values.district,
    draft: values.draft,
    estimation: values.estimation,
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
    responses: formatSubmitResponses(values.responses, proposal.form.questions),
    author: isAdmin && values.author ? values.author.value : undefined,
    id: proposal.id,
    likers: values.likers.map(u => u.value),
    webPageUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedInUrl: '',
    youtubeUrl: '',
  };

  
  if (proposal && proposal.form.isUsingAnySocialNetworks) {
    if (values.webPageUrl) {
      input.webPageUrl = values.webPageUrl;
    }
    if (values.facebookUrl) {
      input.facebookUrl = values.facebookUrl;
    }
    if (values.twitterUrl) {
      input.twitterUrl = values.twitterUrl;
    }
    if (values.instagramUrl) {
      input.instagramUrl = values.instagramUrl;
    }
    if (values.linkedInUrl) {
      input.linkedInUrl = values.linkedInUrl;
    }
    if (values.youtubeUrl) {
      input.youtubeUrl = values.youtubeUrl;
    }
  }

  return ChangeProposalContentMutation.commit({
    input,
    proposalRevisionsEnabled: features.proposal_revisions ?? false,
  })
    .then(response => {
      if (!response.changeProposalContent || !response.changeProposalContent.proposal) {
        throw new Error('Mutation "changeProposalContent" failed.');
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

export const checkProposalContent = (
  values: FormValues | FrontendFormValues,
  proposalForm:
    | ProposalForm_proposalForm
    | $PropertyType<ProposalAdminContentForm_proposal, 'form'>,
  features: FeatureToggles,
  intl: IntlShape,
  isDraft: boolean,
) => {
  const messages = {};
  if (!values.title || values.title.length <= 2) {
    messages.title = isDraft
      ? 'proposal.constraints.title_for_draft'
      : 'proposal.constraints.title';
  } else if (values.title.length >= 255) {
    messages.title = 'question.title.max_length';
  }
  if (
    proposalForm.usingSummary &&
    values.summary &&
    (values.summary.length > 140 || values.summary.length < 2)
  ) {
    messages.summary = 'proposal.constraints.summary';
  }
  if (
    proposalForm.usingDescription &&
    proposalForm.descriptionMandatory &&
    (!values.body || values.body.length <= 2)
  ) {
    messages.body = 'proposal.constraints.body';
  }

  if (proposalForm.usingAddress && !values.address) {
    messages.addressText = 'proposal.constraints.address';
  }

  if (
    proposalForm.categories.length &&
    proposalForm.usingCategories &&
    proposalForm.categoryMandatory &&
    !values.category
  ) {
    messages.category = 'proposal.constraints.category';
  }
  if (
    features.districts &&
    proposalForm.usingDistrict &&
    proposalForm.districtMandatory &&
    !values.district
  ) {
    messages.district = 'proposal.constraints.district';
  }
  if (features.themes && proposalForm.usingThemes && proposalForm.themeMandatory && !values.theme) {
    messages.theme = 'proposal.constraints.theme';
  }

  return messages;
};

const memoizeAvailableQuestions: any = memoize(() => {});

export const validateProposalContent = (
  values: FormValues | FrontendFormValues,
  proposalForm: ProposalForm_proposalForm,
  features: FeatureToggles,
  intl: IntlShape,
  isDraft: boolean,
  availableQuestions: Array<string>,
  async: boolean = false,
) => {
  const MIN_LENGTH_TITLE = 2;
  const MAX_LENGTH_TITLE = 255;

  const errors = !isDraft
    ? checkProposalContent(values, proposalForm, features, intl, isDraft)
    : {};

  if (!values.title || values.title.length <= MIN_LENGTH_TITLE) {
    errors.title = isDraft ? 'proposal.constraints.title_for_draft' : 'proposal.constraints.title';
  } else if (values.title.length >= MAX_LENGTH_TITLE) {
    errors.title = 'question.title.max_length';
  }

  if (
    proposalForm.usingSummary &&
    values.summary &&
    (values.summary.length > 140 || values.summary.length < 2)
  ) {
    errors.summary =
      values.summary.length > 140
        ? 'proposal.constraints.summary'
        : 'proposal.constraints.min.summary';
  }
  if (proposalForm.isUsingAnySocialNetworks) {
    if (values.webPageUrl && !isUrl(values.webPageUrl)) {
      errors.webPageUrl = 'error-webPage-url';
    }

    if (values.facebookUrl && (!values.facebookUrl.match(fbRegEx) || !isUrl(values.facebookUrl))) {
      errors.facebookUrl = {
        id: 'error-invalid-facebook-url',
      };
    }

    if (
      values.twitterUrl &&
      (!values.twitterUrl.match(twitterRegEx) || !isUrl(values.twitterUrl))
    ) {
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
    if (
      values.youtubeUrl &&
      (!values.youtubeUrl.match(youtubeRegEx) || !isUrl(values.youtubeUrl))
    ) {
      errors.youtubeUrl = {
        id: 'error-invalid-youtube-url',
      };
    }
  }

  const responsesError = validateResponses(
    proposalForm.questions,
    values.responses,
    'proposal',
    intl,
    isDraft,
    availableQuestions,
    async,
  );

  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses;
  }

  return errors;
};

export const warnProposalContent = (
  values: FormValues | FrontendFormValues,
  proposalForm: ProposalForm_proposalForm,
  features: FeatureToggles,
  intl: IntlShape,
  isDraft: boolean,
) => {
  const warnings = checkProposalContent(values, proposalForm, features, intl, isDraft);
  const responsesWarning = warnResponses(
    proposalForm.questions,
    values.responses,
    'proposal',
    intl,
  );
  if (responsesWarning.responses && responsesWarning.responses.length) {
    warnings.responses = responsesWarning.responses;
  }

  return warnings;
};

const validate = (values: FormValues, { proposal, features, intl }: Props) => {
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    'availableQuestions',
  );
  // $FlowFixMe
  validateProposalContent(values, proposal.form, features, intl, values.draft, availableQuestions);
};

type State = {
  showEditFusionModal: boolean,
};

export class ProposalAdminContentForm extends React.Component<Props, State> {
  constructor() {
    super();

    this.state = {
      showEditFusionModal: false,
    };
  }

  render() {
    const {
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      proposal,
      features,
      submitting,
      isAdmin,
      themes,
      handleSubmit,
      intl,
      change,
      responses,
      dispatch,
    } = this.props;
    const { form } = proposal;
    const { categories } = proposal.form;
    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.optional" />
      </span>
    );

    const { showEditFusionModal } = this.state;

    return (
      <>
        <>
          <ProposalFusionEditModal
            onClose={() => {
              this.setState({ showEditFusionModal: false });
            }}
            show={showEditFusionModal}
            proposal={proposal}
          />
          {proposal.mergedIn.length > 0 && (
            <Panel className="mt-30 mb-0 panel_flex">
              <Panel.Heading>
                <FormattedMessage id="grouped-into-a-new-proposal" />
              </Panel.Heading>
              <ListGroup fill>
                {proposal.mergedIn.map(parent => (
                  <ListGroupItem key={parent.id}>
                    <a href={parent.adminUrl}>{parent.title}</a>
                    {parent.mergedFrom.length > 2 && (
                      <Button
                        bsStyle="danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              intl.formatMessage({
                                id: 'are-you-sure-you-want-to-delete-this-item',
                              }),
                            )
                          ) {
                            UpdateProposalFusionMutation.commit({
                              input: {
                                proposalId: parent.id,
                                fromProposals: parent.mergedFrom
                                  .map(child => child.id)
                                  .filter(id => id !== proposal.id),
                              },
                            });
                          }
                        }}>
                        <FormattedMessage id="global.delete" />
                      </Button>
                    )}
                  </ListGroupItem>
                ))}
              </ListGroup>
              <ListGroup fill>
                {proposal.mergedFrom.map(child => (
                  <ListGroupItem key={child.id}>
                    <a href={child.adminUrl}>{child.title}</a>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Panel>
          )}
        </>
        <form onSubmit={handleSubmit}>
          <div className="box box-primary container-fluide">
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="global.contenu" />
              </h3>
              <a
                className="pull-right link"
                target="_blank"
                rel="noopener noreferrer"
                href={intl.formatMessage({ id: 'admin.help.link.proposal.body' })}>
                <i className="fa fa-info-circle" />
                {intl.formatMessage({ id: 'global.help' })}
              </a>
            </div>
            <div className="box-content box-content__content-form">
              <Field
                name="title"
                component={component}
                type="text"
                id="proposal_title"
                label={<FormattedMessage id="proposal.title" />}
              />
              <Field
                name="summary"
                component={component}
                type="textarea"
                id="global.summary"
                label={
                  <span>
                    <FormattedMessage id="global.summary" />
                    {optional}
                  </span>
                }
              />
              <UserListField
                disabled={!isAdmin}
                id="proposal-admin-author"
                name="author"
                ariaControls="ProposalAdminContentForm-filter-user-listbox"
                label={<FormattedMessage id="global.author" />}
                labelClassName="control-label"
                inputClassName="fake-inputClassName"
                placeholder={intl.formatMessage({ id: 'global.author' })}
                selectFieldIsObject
                multi={false}
                autoload={false}
                clearable={false}
              />
              {features.themes && form.usingThemes && (
                <Field
                  name="theme"
                  id="global.theme"
                  type="select"
                  component={component}
                  label={
                    <span>
                      <FormattedMessage id="global.theme" />
                      {!form.themeMandatory && optional}
                    </span>
                  }>
                  <FormattedMessage id="proposal.select.theme">
                    {(message: string) => <option value="">{message}</option>}
                  </FormattedMessage>
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.title}
                    </option>
                  ))}
                </Field>
              )}
              {categories.length > 0 && form.usingCategories && (
                <Field
                  id="global.category"
                  type="select"
                  name="category"
                  component={component}
                  label={
                    <span>
                      <FormattedMessage id="global.category" />
                      {!form.categoryMandatory && optional}
                    </span>
                  }>
                  <FormattedMessage id="proposal.select.category">
                    {(message: string) => <option value="">{message}</option>}
                  </FormattedMessage>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Field>
              )}
              {features.districts && form.usingDistrict && form.districts.length > 0 && (
                <Field
                  id="proposal_district"
                  type="select"
                  name="district"
                  component={component}
                  label={
                    <span>
                      <FormattedMessage id="proposal.district" />
                      {!form.districtMandatory && optional}
                    </span>
                  }>
                  <FormattedMessage id="proposal.select.district">
                    {(message: string) => <option value="">{message}</option>}
                  </FormattedMessage>
                  {form.districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Field>
              )}
              {form.usingAddress && (
                <Field
                  id="proposal_address"
                  component={component}
                  type="address"
                  name="addressText"
                  formName={formName}
                  label={<FormattedMessage id="proposal_form.address" />}
                  placeholder="proposal.map.form.placeholder"
                  addressProps={{
                    getAddress: (addressComplete: ?AddressComplete) =>
                      change(
                        'address',
                        addressComplete ? JSON.stringify([addressComplete]) : addressComplete,
                      ),
                  }}
                />
              )}
              <Field
                id="proposal_body"
                type="editor"
                name="body"
                component={component}
                label={<FormattedMessage id="proposal.body" />}
              />
              <FieldArray
                intl={intl}
                name="responses"
                component={renderResponses}
                form={formName}
                questions={form.questions}
                change={change}
                responses={responses}
                memoize={memoizeAvailableQuestions}
              />
              <Field
                id="proposal_media"
                name="media"
                component={component}
                type="image"
                image={proposal && proposal.media ? proposal.media.url : null}
                label={
                  <span>
                    <FormattedMessage id="proposal.media" />
                    {optional}
                  </span>
                }
              />
            </div>
          </div>
          {/* on each field check if proposalForm use the field */}
          {proposal.form.isUsingAnySocialNetworks && (
            <ExternaLinksCard paddingY={8} mt={6} backgroundColor={styleGuideColors.white}>
              <Heading
                as="h3"
                color={styleGuideColors.blue800}
                fontWeight="600"
                fontSize="18px"
                lineHeight="24px">
                <FormattedMessage id="external-links" />
              </Heading>
              {proposal.form.usingWebPage && (
                <Field
                  id="proposal_wep_page"
                  name="webPageUrl"
                  placeholder={intl.formatMessage({ id: 'your-url' })}
                  component={component}
                  type="text"
                  label={<FormattedMessage id="form.label_website" />}
                />
              )}
              {proposal.form.usingTwitter && (
                <Field
                  id="proposal_twitter"
                  name="twitterUrl"
                  component={component}
                  type="text"
                  label={<FormattedMessage id="share.twitter" />}
                  placeholder="https://twitter.com/pseudo"
                />
              )}
              {proposal.form.usingFacebook && (
                <Field
                  id="proposal_facebook"
                  name="facebookUrl"
                  component={component}
                  type="text"
                  label={<FormattedMessage id="share.facebook" />}
                  placeholder="https://facebook.com/pseudo"
                />
              )}
              {proposal.form.usingInstagram && (
                <Field
                  id="proposal_instagram"
                  name="instagramUrl"
                  component={component}
                  type="text"
                  label={<FormattedMessage id="instagram" />}
                  placeholder="https://instagram.com/pseudo"
                />
              )}
              {proposal.form.usingLinkedIn && (
                <Field
                  id="proposal_linkedin"
                  name="linkedInUrl"
                  component={component}
                  type="text"
                  label={<FormattedMessage id="share.linkedin" />}
                  placeholder="https://linkedin.com/in/pseudo"
                />
              )}
              {proposal.form.usingYoutube && (
                <Field
                  id="proposal_youtube"
                  name="youtubeUrl"
                  component={component}
                  type="text"
                  label={<FormattedMessage id="youtube" />}
                  placeholder="https://youtube.com/channel/pseudo"
                />
              )}
            </ExternaLinksCard>
          )}
          <Flex spacing={24} mt={24} mb={24} direction="row">
            <NotationCard backgroundColor="white" flex="1" px={24}>
              <Flex spacing="9px">
                <Text
                  as="h3"
                  color={styleGuideColors.blue800}
                  fontWeight="600"
                  fontSize="18px"
                  lineHeight="24px"
                  margin="0">
                  <FormattedMessage id="proposal.estimation" />
                </Text>
                <a
                  style={{ marginTop: 3 }}
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={intl.formatMessage({ id: 'admin.help.link.proposal.estimation' })}>
                  <Icon name={ICON_NAME.information} size={14} color={colors.blue} />
                </a>
              </Flex>
              <Flex
                mt={
                  !proposal.form.analysisConfiguration?.costEstimationEnabled ||
                  (proposal.form.analysisConfiguration?.costEstimationEnabled &&
                    proposal.decision?.state === 'DONE' &&
                    proposal.form?.analysisConfiguration?.isImmediatelyEffective)
                    ? '8px'
                    : '24px'
                }
                mb="24px">
                {!proposal.form.analysisConfiguration?.costEstimationEnabled ||
                (proposal.form.analysisConfiguration?.costEstimationEnabled &&
                  proposal.decision?.state === 'DONE' &&
                  proposal.form?.analysisConfiguration?.isImmediatelyEffective) ? null : (
                  <AppBox className="excerpt" mr={20}>
                    <Icon name={ICON_NAME.money} size="7rem" />
                  </AppBox>
                )}
                <AppBox
                  ml={
                    !proposal.form.analysisConfiguration?.costEstimationEnabled ||
                    (proposal.form.analysisConfiguration?.costEstimationEnabled &&
                      proposal.decision?.state === 'DONE' &&
                      proposal.form?.analysisConfiguration?.isImmediatelyEffective)
                      ? 0
                      : 20
                  }>
                  <Text
                    as="div"
                    color={styleGuideColors.gray500}
                    maxWidth="450px"
                    fontSize="13px"
                    fontWeight="normal"
                    lineHeight="16px">
                    <FormattedMessage
                      id={
                        !proposal.form.analysisConfiguration?.costEstimationEnabled ||
                        (proposal.form.analysisConfiguration?.costEstimationEnabled &&
                          proposal.decision?.state === 'DONE' &&
                          proposal.form?.analysisConfiguration?.isImmediatelyEffective)
                          ? 'estimation-help-text-2'
                          : 'estimation-help-text'
                      }
                    />
                  </Text>
                  {!proposal.form.analysisConfiguration?.costEstimationEnabled ||
                  (proposal.form.analysisConfiguration?.costEstimationEnabled &&
                    proposal.decision?.state === 'DONE' &&
                    proposal.form?.analysisConfiguration?.isImmediatelyEffective) ? (
                    <Field
                      name="estimation"
                      className="mt-24 mb-24"
                      component={component}
                      normalize={val => parseInt(val, 10)}
                      type="number"
                      id="proposal_estimation"
                      addonBefore={<Glyphicon glyph="euro" />}
                      placeholder={intl.formatMessage({ id: 'estimation-placeholder' })}
                      label={<FormattedMessage id="cost" />}
                      labelClassName="mb-5"
                    />
                  ) : (
                    <AppBox
                      mt="16px"
                      color={styleGuideColors.blue500}
                      fontWeight="bold"
                      fontSize="11px">
                      <a href={`${proposal.form.adminUrl}#openAnalysisStep`}>
                        <FormattedMessage id="link.parameters.check" />
                      </a>
                    </AppBox>
                  )}
                </AppBox>
              </Flex>
            </NotationCard>
            <NotationCard backgroundColor="white" flex="1" px={24}>
              <Flex spacing="9px">
                <Text
                  as="h3"
                  color={styleGuideColors.blue800}
                  fontWeight="600"
                  fontSize="18px"
                  lineHeight="24px"
                  margin="0">
                  <FormattedMessage id="admin.fields.proposal.likers" />
                </Text>
                <a
                  style={{ marginTop: 3 }}
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={intl.formatMessage({ id: 'admin.help.link.proposal.heart' })}>
                  <Icon name={ICON_NAME.information} size={14} color={colors.blue} />
                </a>
              </Flex>
              <AppBox
                color={styleGuideColors.gray500}
                mt="8px"
                maxWidth="450px"
                fontSize="13px"
                fontWeight="normal"
                lineHeight="16px">
                <FormattedMessage id="likers-helpText" />
              </AppBox>
              <UserListField
                id="likers"
                name="likers"
                ariaControls="ProposalAdminNotationForm-filter-user-listbox"
                label={<FormattedMessage id="admin.fields.event_registration.user" />}
                abelClassName="mt-0 mb-5"
                blockClassName="likers-fields"
                autoload={false}
                clearable={false}
                inputClassName="fake-inputClassName"
                placeholder={intl.formatMessage({ id: 'select-users' })}
                multi
                noOptionsMessage="no_result"
              />
            </NotationCard>
          </Flex>
          <>
            <ButtonToolbar className="box-content__toolbar">
              <SubmitButton
                type="submit"
                id="proposal_admin_content_save"
                bsStyle="primary"
                disabled={pristine || submitting}
                onSubmit={() => {
                  dispatch(submit(formName));
                }}
                label={submitting ? 'global.loading' : 'global.save'}
              />
              {features.proposal_revisions && (
                <ProposalRevision proposal={proposal} isAdminView>
                  {openModal => (
                    <RevisionButton
                      className="bg-white"
                      bsStyle="link"
                      id="proposal_admin_content_revision"
                      onClick={openModal}>
                      {intl.formatMessage({ id: 'request.author.review' })}
                    </RevisionButton>
                  )}
                </ProposalRevision>
              )}
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
          </>
        </form>
      </>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ProposalAdminContentForm);

const mapStateToProps = (state: GlobalState, { proposal }: RelayProps) => {
  const defaultResponses = formatInitialResponsesValues(
    proposal.form.questions,
    proposal.responses ? proposal.responses : [],
  );

  return {
    isAdmin: !!(
      (state.user.user && state.user.user.roles.includes('ROLE_ADMIN')) ||
      (state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN'))
    ),
    features: state.default.features,
    themes: state.default.themes,
    initialValues: {
      draft: proposal.publicationStatus === 'DRAFT',
      title: proposal.title,
      body: proposal.body,
      summary: proposal.summary,
      author: {
        value: proposal.author.id,
        label: proposal.author.displayName,
      },
      theme:
        state.default.features.themes && proposal.form.usingThemes
          ? proposal.theme
            ? proposal.theme.id
            : null
          : undefined,
      category: proposal.form.usingCategories
        ? proposal.category
          ? proposal.category.id
          : null
        : undefined,
      district:
        state.default.features.districts && proposal.form.usingDistrict
          ? proposal.district
            ? proposal.district.id
            : null
          : undefined,
      address:
        proposal.form.usingAddress && proposal.address?.json ? proposal.address.json : undefined,
      media: proposal.media ? proposal.media : null,
      responses: defaultResponses,
      addressText: proposal.address ? proposal.address.formatted : null,
      estimation: proposal.decision?.estimatedCost
        ? proposal.decision?.estimatedCost
        : proposal.estimation
        ? proposal.estimation
        : null,
      likers: proposal.likers.map(u => ({
        value: u.id,
        label: u.displayName,
      })),
      webPageUrl: proposal.webPageUrl ? proposal.webPageUrl : null,
      facebookUrl: proposal.facebookUrl ? proposal.facebookUrl : null,
      twitterUrl: proposal.twitterUrl ? proposal.twitterUrl : null,
      instagramUrl: proposal.instagramUrl ? proposal.instagramUrl : null,
      linkedInUrl: proposal.linkedInUrl ? proposal.linkedInUrl : null,
      youtubeUrl: proposal.youtubeUrl ? proposal.youtubeUrl : null,
    },
    responses: formValueSelector(formName)(state, 'responses') || defaultResponses,
  };
};

const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(form));
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAdminContentForm_proposal on Proposal
      @argumentDefinitions(proposalRevisionsEnabled: { type: "Boolean!" }) {
      ...ProposalFusionEditModal_proposal
      ...ProposalRevision_proposal @include(if: $proposalRevisionsEnabled)
      id
      estimation
      likers {
        id
        displayName
      }
      mergedFrom {
        id
        adminUrl
        title
      }
      mergedIn {
        id
        adminUrl
        title
        mergedFrom {
          id
        }
      }
      author {
        id
        displayName
      }
      theme {
        id
      }
      category {
        id
      }
      district {
        id
      }
      title
      body
      summary
      twitterUrl
      webPageUrl
      facebookUrl
      instagramUrl
      linkedInUrl
      youtubeUrl
      address {
        json
        formatted
      }
      publicationStatus
      responses {
        ...responsesHelper_response @relay(mask: false)
      }
      media {
        id
        url
      }
      decision {
        estimatedCost
        state
      }
      form {
        id
        adminUrl
        analysisConfiguration {
          costEstimationEnabled
          isImmediatelyEffective
        }
        districts {
          id
          name
        }
        categories {
          id
          name
        }
        questions {
          id
          ...responsesHelper_adminQuestion @relay(mask: false)
        }
        usingDistrict
        usingDescription
        usingSummary
        descriptionMandatory
        districtMandatory
        usingThemes
        themeMandatory
        usingCategories
        categoryMandatory
        usingAddress
        usingFacebook
        usingWebPage
        usingTwitter
        usingInstagram
        usingYoutube
        usingLinkedIn
        isUsingAnySocialNetworks
      }
    }
  `,
});
