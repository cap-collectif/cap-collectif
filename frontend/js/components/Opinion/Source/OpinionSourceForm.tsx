import React from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import { reduxForm, Field, SubmissionError, clearSubmitErrors } from 'redux-form'
import renderComponent from '../../Form/Field'
import { isUrl } from '~/services/Validator'
import AddSourceMutation from '~/mutations/AddSourceMutation'
import ChangeSourceMutation from '~/mutations/ChangeSourceMutation'
import { hideSourceCreateModal, hideSourceEditModal } from '~/redux/modules/opinion'
import type { OpinionSourceForm_source } from '~relay/OpinionSourceForm_source.graphql'
import type { OpinionSourceForm_sourceable } from '~relay/OpinionSourceForm_sourceable.graphql'
import type { State } from '~/types'
import { toast } from '~ds/Toast'

type SourceCategory = {
  title: string | null | undefined
  id: string
}
type FormValues = {
  title: string | null | undefined
  body: string | null | undefined
  category: string | null | undefined
  link: string | null | undefined
  check?: boolean
}
type FormValidValues = {
  title: string
  body: string
  category: string
  link: string
}
type RelayProps = {
  source: OpinionSourceForm_source
  sourceable: OpinionSourceForm_sourceable
}
type Props = ReduxFormFormProps &
  RelayProps & {
    user: {
      isEmailConfirmed: boolean
    }
    intl: IntlShape
  }

const isSourceCategoryTranslated = (sourceCategory: SourceCategory) => {
  return !!sourceCategory.title
}

const validate = ({ title, body, category, link, check }: FormValues) => {
  const errors: any = {}

  if (!title || title.length <= 2) {
    errors.title = 'source.constraints.title'
  }

  if (!body || body.length <= 2) {
    errors.body = 'source.constraints.body'
  }

  if (!category) {
    errors.category = 'source.constraints.category'
  }

  if (!link || !isUrl(link)) {
    errors.link = 'source.constraints.link'
  }

  if (!check) {
    errors.check = 'source.constraints.check'
  }

  return errors
}

const onSubmit = (values: FormValidValues, dispatch, props: Props) => {
  const { sourceable, source, user, intl } = props

  if (!source) {
    const input = {
      sourceableId: sourceable.id,
      title: values.title,
      body: values.body,
      category: values.category,
      link: values.link,
    }
    return AddSourceMutation.commit(
      {
        input,
      },
      user.isEmailConfirmed,
    ).then(res => {
      if (!res.addSource || !res.addSource.sourceEdge) {
        toast({ content: intl.formatMessage({ id: 'alert.danger.add.source' }), variant: 'danger' })

        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      }
      toast({ content: intl.formatMessage({ id: 'alert.success.add.source' }), variant: 'success' })

      dispatch(hideSourceCreateModal())
    })
  }

  const input = {
    sourceId: source.id,
    title: values.title,
    body: values.body,
    category: values.category,
    link: values.link,
  }
  return ChangeSourceMutation.commit({
    input,
  }).then(res => {
    if (!res.changeSource || !res.changeSource.source) {
      toast({ content: intl.formatMessage({ id: 'alert.danger.update.source' }), variant: 'danger' })

      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    }
    toast({ content: intl.formatMessage({ id: 'alert.success.update.source' }), variant: 'success' })
    dispatch(hideSourceEditModal())
  })
}

export const formName = 'opinion-source-form'

class OpinionSourceForm extends React.Component<Props> {
  render() {
    const { error, dispatch, source, sourceable, intl } = this.props
    return (
      <form id="source-form">
        {error && (
          <Alert
            bsStyle="warning"
            onDismiss={() => {
              dispatch(clearSubmitErrors(formName))
            }}
          >
            {error === 'publication-limit-reached' ? (
              <div>
                <h4>
                  <strong>
                    <FormattedMessage id="publication-limit-reached" />
                  </strong>
                </h4>
                <FormattedMessage id="publication-limit-reached-argument-content" />
              </div>
            ) : (
              <FormattedHTMLMessage id="global.error.server.form" />
            )}
          </Alert>
        )}
        {source && (
          <div className="alert alert-warning edit-confirm-alert">
            <Field
              type="checkbox"
              name="check"
              wrapperClassName="checkbox"
              id="sourceEditCheck"
              component={renderComponent}
            >
              <FormattedMessage id="source.check" />
            </Field>
          </div>
        )}
        <Field
          type="select"
          name="category"
          id="sourceCategory"
          component={renderComponent}
          label={<FormattedMessage id="source.type" />}
        >
          {!source && (
            <option value="" disabled>
              {intl.formatMessage({
                id: 'global.select',
              })}
            </option>
          )}
          {sourceable.availableSourceCategories &&
            sourceable.availableSourceCategories.filter(isSourceCategoryTranslated).map(category => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
        </Field>
        <Field
          id="sourceLink"
          name="link"
          component={renderComponent}
          type="text"
          label={<FormattedMessage id="source.link" />}
          placeholder="http://"
        />
        <Field
          id="sourceTitle"
          type="text"
          name="title"
          component={renderComponent}
          label={<FormattedMessage id="global.title" />}
        />
        <Field
          id="sourceBody"
          type="editor-ds"
          component={renderComponent}
          name="body"
          label={<FormattedMessage id="source.body" />}
        />
      </form>
    )
  }
}

const mapStateToProps = (state: State, { source }: RelayProps) => ({
  user: state.user.user,
  initialValues: {
    link: source ? source.link : '',
    title: source ? source.title : '',
    body: source ? source.body : '',
    category: source && source.category ? source.category.id : null,
    check: !source,
  },
})

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(OpinionSourceForm),
)
const containerWithIntl = injectIntl(container)
export default createFragmentContainer(containerWithIntl, {
  source: graphql`
    fragment OpinionSourceForm_source on Source {
      id
      link
      title
      body
      category {
        id
      }
    }
  `,
  sourceable: graphql`
    fragment OpinionSourceForm_sourceable on Sourceable {
      id
      availableSourceCategories {
        id
        title
      }
    }
  `,
})
