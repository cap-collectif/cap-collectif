import React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { Field, reduxForm, SubmissionError } from 'redux-form'
import { connect } from 'react-redux'
import type { Dispatch, State } from '~/types'
import renderInput from '../../Form/Field'
import { closeOpinionEditModal } from '~/redux/modules/opinion'
import type { OpinionEditForm_opinion } from '~relay/OpinionEditForm_opinion.graphql'
import { isHTML } from '~/utils/isHtml'
import UpdateOpinionMutation from '~/mutations/UpdateOpinionMutation'
import FluxDispatcher from '../../../dispatchers/AppDispatcher'

type RelayProps = {
  opinion: OpinionEditForm_opinion
}
export const formName = 'opinion-edit-form'

const validate = ({ title, body, check }: Record<string, any>) => {
  const errors: any = {}

  if (!title || title.length < 2) {
    errors.title = 'proposal.constraints.title'
  }

  if (!body || (isHTML(body) && $(body).text().length < 2)) {
    errors.body = 'opinion.constraints.body'
  }

  if (!check) {
    errors.check = 'global.constraints.check'
  }

  return errors
}

const onSubmit = (data: Record<string, any>, dispatch: Dispatch, props: Record<string, any>) => {
  const { opinion } = props
  // We format appendices to call API (could be improved by changing api design)
  const appendices = Object.keys(data)
    .filter(key => key !== 'title' && key !== 'body' && key !== 'check')
    .map(key => ({
      appendixType: opinion.appendices.filter(a => a.appendixType.title === key)[0].appendixType.id,
      body: data[key],
    }))
  UpdateOpinionMutation.commit({
    input: {
      opinionId: opinion.id,
      title: data.title,
      body: data.body,
      appendices,
    },
  }).then(response => {
    const errorCode = response?.updateOpinion?.errorCode
    const url = response?.updateOpinion?.opinion?.url

    if (url) {
      FluxDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'success',
          content: 'proposal-edit',
        },
      })
      dispatch(closeOpinionEditModal())
      setTimeout(() => {
        window.location.href = url
      }, 1000)
    }

    switch (errorCode) {
      case null:
        return

      default:
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
    }
  })
}

type Props = RelayProps & {
  handleSubmit: (...args: Array<any>) => any
  initialValues: Record<string, any>
}
export class OpinionEditForm extends React.Component<Props> {
  render() {
    const { opinion, handleSubmit } = this.props
    const { step } = opinion
    return (
      <form id={formName} onSubmit={handleSubmit}>
        <Field
          type="checkbox"
          wrapperClassName="checkbox"
          name="check"
          component={renderInput}
          id="opinion_check"
          divClassName="alert alert-warning edit-confirm-alert"
        >
          <FormattedMessage id="opinion.edit_check" />
        </Field>
        <Field
          name="title"
          type="text"
          id="opinion_title"
          component={renderInput}
          help={step.consultations?.edges && step.consultations.edges[0]?.node.titleHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.title" />}
        />
        <Field
          name="body"
          type="editor-ds"
          id="opinion_body"
          component={renderInput}
          help={step.consultations?.edges && step.consultations.edges[0]?.node.descriptionHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.body" />}
        />
        {opinion.appendices &&
          opinion.appendices
            .filter(Boolean)
            .map((field, index) => (
              <Field
                key={index}
                component={renderInput}
                name={field.appendixType.title}
                label={field.appendixType.title}
                type="editor-ds"
                id={`opinion_appendix-${index + 1}`}
              />
            ))}
      </form>
    )
  }
}

const mapStateToProps = (state: State, props: RelayProps) => {
  const dynamicsInitialValues = {}

  if (props.opinion.appendices) {
    for (const appendix of props.opinion.appendices) {
      if (appendix && appendix.appendixType) {
        dynamicsInitialValues[appendix.appendixType.title] = appendix.body
      }
    }
  }

  return {
    initialValues: {
      title: props.opinion.title,
      body: props.opinion.body,
      ...dynamicsInitialValues,
    },
  }
}

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(
  reduxForm({
    form: formName,
    onSubmit,
    validate,
  })(OpinionEditForm),
)
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionEditForm_opinion on Opinion {
      appendices {
        appendixType {
          title
        }
        body
      }
      step {
        consultations(first: 1) {
          edges {
            node {
              titleHelpText
              descriptionHelpText
            }
          }
        }
      }
      id
      title
      body
    }
  `,
})
