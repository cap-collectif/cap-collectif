import React from 'react'
import { FormattedMessage, IntlShape, injectIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import component from '../../Form/Field'
import ChangeArgumentMutation from '../../../mutations/ChangeArgumentMutation'
import { closeArgumentEditModal } from '../../../redux/modules/opinion'
import type { State } from '../../../types'
import type { ArgumentForm_argument } from '~relay/ArgumentForm_argument.graphql'
import { toast } from '~ds/Toast'

export const formName = 'argument-edit-form'
type FormValues = {
  body?: string
  confirm?: boolean
}
type FormValidValues = {
  body: string
  confirm?: boolean
}
type Props = {
  argument: ArgumentForm_argument
  intl: IntlShape
}

const validate = ({ body, confirm }: FormValues) => {
  const errors: any = {}

  if (!body || body.length <= 2) {
    errors.body = 'argument.constraints.min'
  }

  if (!confirm) {
    errors.confirm = 'argument.constraints.confirm'
  }

  return errors
}

const onSubmit = (values: FormValidValues, dispatch, { argument, intl }: Props) => {
  const input = {
    argumentId: argument.id,
    body: values.body,
  }
  return ChangeArgumentMutation.commit({
    input,
  })
    .then(() => {
      toast({ content: intl.formatMessage({ id: 'alert.success.update.argument' }), variant: 'success' })
      dispatch(closeArgumentEditModal())
    })
    .catch(() => {
      toast({ content: intl.formatMessage({ id: 'alert.danger.update.argument' }), variant: 'danger' })
    })
}

const ArgumentForm = () => (
  <form id="argument-form">
    <div className="alert alert-warning edit-confirm-alert">
      <Field type="checkbox" wrapperClassName="checkbox" component={component} id="argument-confirm" name="confirm">
        <FormattedMessage id="argument.edit.confirm" />
      </Field>
    </div>
    <Field
      id="argument-body"
      component={component}
      type="textarea"
      rows={2}
      name="body"
      label={<FormattedMessage id="global.contenu" />}
    />
  </form>
)

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    body: props.argument.body,
    confirm: false,
  },
})

const connector = connect<any, any>(mapStateToProps)
const container = injectIntl(
  connector(
    reduxForm({
      validate,
      onSubmit,
      form: formName,
    })(ArgumentForm),
  ),
)
export default createFragmentContainer(container, {
  argument: graphql`
    fragment ArgumentForm_argument on Argument {
      id
      body
    }
  `,
})
