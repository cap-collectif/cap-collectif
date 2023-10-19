import React, { useState } from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage, injectIntl, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Glyphicon, InputGroup } from 'react-bootstrap'
import { useResize } from '@liinkiing/react-hooks'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import debounce from 'debounce-promise'
import { reduxForm, formValueSelector, change, Field, SubmissionError } from 'redux-form'
import type { ProposalDecisionFormPanel_proposal } from '~relay/ProposalDecisionFormPanel_proposal.graphql'
import colors from '~/utils/colors'
import { ICON_NAME } from '~/components/Ui/Icons/Icon'
import type { GlobalState, Dispatch } from '~/types'
import { bootstrapGrid } from '~/utils/sizes'
import component from '~/components/Form/Field'
import select from '~/components/Form/Select'
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel'
import ChangeProposalDecisionMutation from '~/mutations/ChangeProposalDecisionMutation'
import UserListField from '~/components/Admin/Field/UserListField'
import { TYPE_FORM } from '~/constants/FormConstants'
import { Validation, ValidateButton, AnalysisForm } from './ProposalAnalysisFormPanel'
import type { SubmittingState } from './ProposalFormSwitcher'
import './ProposalFormSwitcher'
import ProposalRevision from '~/shared/ProposalRevision/ProposalRevision'
import { RevisionButton } from '~/shared/ProposalRevision/styles'
import ProposalRevisionPanel from '~/components/Proposal/Analysis/ProposalRevisionPanel'

const PostWrapper: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  margin-top: 10px;
  padding: 15px;
  background: ${colors.grayF4};
`
type Props = ReduxFormFormProps & {
  proposalRevisionsEnabled: boolean
  proposal: ProposalDecisionFormPanel_proposal
  disabled?: boolean
  initialIsApproved: boolean
  onValidate: (arg0: SubmittingState, arg1: boolean | null | undefined) => void
  costEstimationEnabled: boolean
}
type Decision = 'FAVOURABLE' | 'UNFAVOURABLE'
export type FormValues = {
  body: string
  authors: Array<{
    label: string
    value: string
  }>
  estimatedCost: number
  isApproved: Decision | null | undefined
  validate?: boolean
  isDone: boolean
  refusedReason: {
    value: string
    label: string
  }
}

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal, onValidate } = props
  const input = {
    proposalId: proposal.id,
    body: values.body,
    authors: values.authors.map(author => author.value),
    estimatedCost:
      typeof values.estimatedCost === 'number' && !Number.isNaN(values.estimatedCost) ? values.estimatedCost : 0,
    isApproved: values.isApproved === 'FAVOURABLE' ? true : values.isApproved === 'UNFAVOURABLE' ? false : null,
    refusedReason: values.isApproved === 'UNFAVOURABLE' ? values.refusedReason?.value : null,
    isDone: values.validate ? true : values.isDone,
  }
  onValidate(values.validate || values.isDone ? 'SAVING' : 'DRAFT_SAVING')
  return ChangeProposalDecisionMutation.commit({
    input,
  })
    .then(() => {
      onValidate(values.validate || values.isDone ? 'SAVED' : 'DRAFT_SAVED', values.validate)
    })
    .catch(e => {
      if (e instanceof SubmissionError) {
        throw e
      }

      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    })
}

const formName = 'proposal-decision-form'
export const ProposalDecisionFormPanel = ({
  dispatch,
  initialIsApproved,
  disabled,
  proposal,
  costEstimationEnabled,
  proposalRevisionsEnabled,
}: Props) => {
  const intl = useIntl()
  const [isApproved, setIsApproved] = useState(initialIsApproved)
  const { width } = useResize()
  const isLarge = width < bootstrapGrid.mdMax
  const refusedReasons = proposal?.form.analysisConfiguration?.unfavourableStatuses || []
  const effectiveDate = proposal?.form.analysisConfiguration?.effectiveDate
  return (
    <>
      <form id={formName}>
        {proposalRevisionsEnabled && <ProposalRevisionPanel proposal={proposal} />}
        <AnalysisForm>
          {costEstimationEnabled && (
            <>
              <label className="mb-15">
                <FormattedMessage id="proposal.estimation" />
              </label>
              <InputGroup
                className="form-fields mb-10"
                bsClass="input-group"
                style={{
                  zIndex: '1',
                }}
              >
                <InputGroup.Addon>
                  <Glyphicon glyph="euro" />
                </InputGroup.Addon>
                <Field
                  component={component}
                  type="number"
                  min={0}
                  id="proposalDecision-estimatedCost"
                  name="estimatedCost"
                  normalize={val => (val ? parseFloat(val) : null)}
                />
              </InputGroup>
            </>
          )}

          <label>
            <FormattedMessage id="official.answer" />
          </label>
          <PostWrapper>
            <UserListField
              id="proposalDecision-authors"
              name="authors"
              clearable
              selectFieldIsObject
              debounce
              autoload={false}
              multi
              placeholder=" "
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              label={<FormattedMessage id="admin.fields.project.authors" />}
              ariaControls="EventListFilters-filter-author-listbox"
            />
            <Field
              type="editor-ds"
              name="body"
              id="proposalDecision-body"
              label={<FormattedMessage id="global.contenu" />}
              component={component}
            />
          </PostWrapper>
        </AnalysisForm>
        <Validation isLarge={isLarge}>
          <Field
            onChange={() => setIsApproved('FAVOURABLE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            label={<FormattedMessage id="global.review" />}
            component={component}
            id="isApproved-FAVOURABLE"
            name="isApproved"
            type="radio"
            value="FAVOURABLE"
            radioChecked={isApproved === true}
          >
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={12}
              color={colors.lightGreen}
              iconName={ICON_NAME.favorable}
              text="global.favorable"
            />
          </Field>
          <Field
            onChange={() => setIsApproved('UNFAVOURABLE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            component={component}
            id="isApproved-UNFAVOURABLE"
            name="isApproved"
            type="radio"
            value="UNFAVOURABLE"
            radioChecked={isApproved === false}
          >
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={10}
              color={colors.dangerColor}
              iconName={ICON_NAME.unfavorable}
              text="global.filter-unfavourable"
            />
          </Field>
          {(isApproved === 'UNFAVOURABLE' || initialIsApproved === 'UNFAVOURABLE') && refusedReasons?.length ? (
            <Field
              selectFieldIsObject
              debounce
              autoload
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              component={select}
              name="refusedReason"
              id="decision-refusedReason"
              placeholder=" "
              label={<FormattedMessage id="reason" />}
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="true"
              options={refusedReasons}
            />
          ) : null}

          <FormattedMessage
            tagName="p"
            id={effectiveDate ? 'publication.date.personalized' : 'data.publication.automatic'}
            values={{
              date: intl.formatDate(effectiveDate, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }),
              hour: intl.formatDate(effectiveDate, {
                hour: 'numeric',
                minute: 'numeric',
              }),
            }}
          />

          <ValidateButton
            disabled={disabled || (isApproved === null && initialIsApproved === null)}
            type="button"
            id="validate-proposal-decision-button"
            onClick={() => {
              dispatch(change(formName, 'validate', true))
            }}
          >
            <FormattedMessage id="validate" />
          </ValidateButton>
          {proposalRevisionsEnabled && (
            <ProposalRevision proposal={proposal} unstable__enableCapcoUiDs>
              {openModal => (
                <RevisionButton onClick={openModal} id="proposal-analysis-revision" type="button">
                  <FormattedMessage id="request.author.review" />
                </RevisionButton>
              )}
            </ProposalRevision>
          )}
        </Validation>
      </form>
    </>
  )
}

const mapStateToProps = (state: GlobalState, { proposal }: Props) => {
  const isApproved = proposal?.decision?.isApproved
  return {
    initialValues: {
      body: proposal?.decision?.officialResponse?.body || proposal?.assessment?.officialResponse || null,
      estimatedCost: proposal?.assessment?.estimatedCost || proposal?.decision?.estimatedCost || 0,
      authors: proposal?.decision?.officialResponse?.authors || [],
      isApproved: isApproved ? 'FAVOURABLE' : isApproved === false ? 'UNFAVOURABLE' : null,
      refusedReason: proposal?.decision?.refusedReason || null,
      isDone: proposal?.decision?.state === 'DONE' || false,
    },
    costEstimationEnabled: proposal.form?.analysisConfiguration?.costEstimationEnabled || false,
    initialIsApproved: formValueSelector(formName)(state, 'isApproved') || null,
    proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
  }
}

const form = reduxForm({
  form: formName,
  onChange: debounce(onSubmit, 1000),
  onSubmit,
})(ProposalDecisionFormPanel)
// @ts-ignore
const container = connect<any, any>(mapStateToProps)(injectIntl(form))
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDecisionFormPanel_proposal on Proposal
    @argumentDefinitions(proposalRevisionsEnabled: { type: "Boolean!" }) {
      id
      ...ProposalRevisionPanel_proposal @include(if: $proposalRevisionsEnabled)
      ...ProposalRevision_proposal @include(if: $proposalRevisionsEnabled)
      decision {
        state
        estimatedCost
        refusedReason {
          label: name
          value: id
        }
        officialResponse {
          id
          body
          authors {
            value: id
            label: username
          }
        }
        isApproved
      }
      assessment {
        id
        officialResponse
        estimatedCost
      }
      form {
        analysisConfiguration {
          costEstimationEnabled
          effectiveDate
          unfavourableStatuses {
            value: id
            label: name
          }
        }
      }
    }
  `,
})
