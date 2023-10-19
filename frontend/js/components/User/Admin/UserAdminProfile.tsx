import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field, SubmissionError } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import { ButtonToolbar, Button } from 'react-bootstrap'
import type { Dispatch, GlobalState } from '~/types'
import type { UserAdminProfile_user } from '~relay/UserAdminProfile_user.graphql'
import type { UserAdminProfile_viewer } from '~relay/UserAdminProfile_viewer.graphql'
import component from '../../Form/Field'
import AlertForm from '../../Alert/AlertForm'
import UpdateProfilePublicDataMutation from '~/mutations/UpdateProfilePublicDataMutation'
import { REGEX_USERNAME } from '~/constants/FormConstants'
import { fbRegEx, instagramRegEx, linkedInRegEx, twitterRegEx } from '~/components/Utils/SocialNetworkRegexUtils'
import { isUrl } from '~/services/Validator'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
type RelayProps = {
  user: UserAdminProfile_user
  viewer: UserAdminProfile_viewer
}
type FormValues = {
  readonly id: string
  readonly media:
    | {
        readonly id: string
        readonly name: string
        readonly size: string
        readonly url: string
      }
    | null
    | undefined
  readonly url: any | null | undefined
  readonly username: string
  readonly biography: string | null | undefined
  readonly websiteUrl: string | null | undefined
  readonly facebookUrl: string | null | undefined
  readonly linkedInUrl: string | null | undefined
  readonly twitterUrl: string | null | undefined
  readonly instagramUrl: string | null | undefined
  doNotIndexProfile: boolean | null | undefined
  userType: string
  readonly neighborhood: string | null | undefined
  readonly isViewer: boolean
}
type Props = ReduxFormFormProps &
  RelayProps & {
    intl: IntlShape
    // initialValues: FormValues,
    hasValue: Record<string, any>
    userTypes: Array<Record<string, any>>
    isViewerOrSuperAdmin: boolean
  }
const formName = 'user-admin-edit-profile'

const validate = (values: Record<string, any>) => {
  const errors: any = {}
  const fields = [
    'biography',
    'websiteUrl',
    'neighborhood',
    'linkedInUrl',
    'twitterUrl',
    'instagramUrl',
    'facebookUrl',
    'username',
  ]
  fields.forEach(value => {
    if (value === 'username') {
      if (!values[value] || values[value].length < 2) {
        errors[value] = 'registration.constraints.username.min'
      }

      if (values[value] && !REGEX_USERNAME.test(values[value])) {
        errors[value] = 'registration.constraints.username.symbol'
      }
    }

    if ((value === 'userType' && !values[value]) || (values[value] && values[value].length === 0)) {
      values[value] = null
    }

    if (values.facebookUrl && (!values.facebookUrl.match(fbRegEx) || !isUrl(values.facebookUrl))) {
      errors.facebookUrl = {
        id: 'error-invalid-facebook-url',
      }
    }

    if (values.twitterUrl && (!values.twitterUrl.match(twitterRegEx) || !isUrl(values.twitterUrl))) {
      errors.twitterUrl = {
        id: 'error-invalid-socialNetwork-url',
        values: {
          SocialNetworkName: 'Twitter',
        },
      }
    }

    if (values.instagramUrl && (!values.instagramUrl.match(instagramRegEx) || !isUrl(values.instagramUrl))) {
      errors.instagramUrl = {
        id: 'error-invalid-socialNetwork-url',
        values: {
          SocialNetworkName: 'Instagram',
        },
      }
    }

    if (values.linkedInUrl && (!values.linkedInUrl.match(linkedInRegEx) || !isUrl(values.linkedInUrl))) {
      errors.linkedInUrl = {
        id: 'error-invalid-socialNetwork-url',
        values: {
          SocialNetworkName: 'LinkedIn',
        },
      }
    }

    if (values[value] && values[value].length < 2) {
      errors[value] = 'two-characters-minimum-required'
    }

    if (value !== 'biography') {
      if (values[value] && values[value].length > 256) {
        errors[value] = '256-characters-maximum-required'
      }
    }
  })
  return errors
}

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props
  const media = typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null
  const userId = props.user.id
  const profilePageIndexed =
    typeof values.doNotIndexProfile !== 'undefined' ? !values.doNotIndexProfile : props.user.profilePageIndexed
  const { id, isViewer, url, doNotIndexProfile, ...rest } = values
  const input = { ...rest, profilePageIndexed, media, userId, userType: values.userType || null }
  return UpdateProfilePublicDataMutation.commit({
    input,
  })
    .then(response => {
      if (!response.updateProfilePublicData || !response.updateProfilePublicData.user) {
        throw new Error('Mutation "updateProfilePublicData" failed.')
      }
    })
    .catch(response => {
      if (response && response.response && response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        })
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({
            id: 'global.error.server.form',
          }),
        })
      }
    })
}

export const UserAdminProfile = ({
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  handleSubmit,
  submitting,
  userTypes,
  error,
  isViewerOrSuperAdmin,
}: Props) => {
  const useNoIndexProfile = useFeatureFlag('noindex_on_profiles')
  const useUserType = useFeatureFlag('user_type')
  return (
    <div className="box box-primary container-fluid">
      <h2 className="page-header">
        <FormattedMessage id="user.profile.title" />
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="box-content box-content__content-form">
          <Field
            id="profile_avatar"
            name="media"
            label={<FormattedMessage id="sonata.media.provider.image" />}
            component={component}
            type="image"
            divClassName="col-sm-10"
            disabled={!isViewerOrSuperAdmin}
          />
          <Field
            name="username"
            label={
              <div>
                <FormattedMessage id="global.fullname" />
                <span className="excerpt">
                  <FormattedMessage id="global.mandatory" />
                </span>
              </div>
            }
            component={component}
            required
            type="text"
            id="profile-form-username"
            divClassName="col-sm-4"
            disabled={!isViewerOrSuperAdmin}
          />
          <div className="clearfix" />
          {useUserType && (
            <Field
              id="profile-form-userType"
              name="userType"
              component={component}
              type="select"
              divClassName="col-sm-4"
              disabled={!isViewerOrSuperAdmin}
              label={<FormattedMessage id="registration.type" />}
            >
              <FormattedMessage id="registration.select.type">
                {(message: string) => <option value="">{message}</option>}
              </FormattedMessage>
              {userTypes.map((type, i) => (
                <option key={i + 1} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Field>
          )}
          <div className="clearfix" />
          <Field
            name="biography"
            component={component}
            type="textarea"
            id="public-data-form-biography"
            disabled={!isViewerOrSuperAdmin}
            label={<FormattedMessage id="form.label_biography" />}
            divClassName="col-sm-8"
          />
          <div className="clearfix" />
          <Field
            name="neighborhood"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="public-data-form-neighborhood"
            label={<FormattedMessage id="form.label_neighborhood" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <Field
            name="websiteUrl"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="public-data-form-website"
            label={<FormattedMessage id="form.label_website" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <h2>
            <FormattedMessage id="social-medias" />
          </h2>
          <Field
            placeholder="https://"
            name="facebookUrl"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="public-data-form-facebook"
            label={<FormattedMessage id="user.profile.edit.facebook" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <Field
            placeholder="https://"
            name="instagramUrl"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="public-data-form-instagram"
            divClassName="col-sm-4"
            label={<FormattedMessage id="instagram-profile" />}
          />
          <div className="clearfix" />
          <Field
            placeholder="https://"
            name="twitterUrl"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="public-data-form-twitter"
            divClassName="col-sm-4"
            label={<FormattedMessage id="user.profile.edit.twitter" />}
          />
          <div className="clearfix" />
          <Field
            placeholder="https://"
            name="linkedInUrl"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="public-data-form-linkedIn"
            divClassName="col-sm-4"
            label={<FormattedMessage id="show.label_linked_in_url" />}
          />
          <div className="clearfix" />
          {!useNoIndexProfile ? (
            <>
              <h2 className="page-header">
                <FormattedMessage id="confidentialite.title" />
              </h2>
              <Field
                id="profilePageIndexed"
                name="doNotIndexProfile"
                component={component}
                type="checkbox"
                disabled={!isViewerOrSuperAdmin}
                labelClassName="font-weight-normal"
                divClassName="col-sm-8"
              >
                <FormattedMessage id="user.profile.edit.profilePageIndexed" />
              </Field>
            </>
          ) : null}
          <div className="clearfix" />
          <ButtonToolbar className="box-content__toolbar">
            <Button
              disabled={invalid || submitting || !isViewerOrSuperAdmin}
              type="submit"
              bsStyle="primary"
              id="user-admin-profile-save"
            >
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
            </Button>
            <AlertForm
              valid={valid}
              invalid={invalid}
              errorMessage={error}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </ButtonToolbar>
        </div>
      </form>
    </div>
  )
}
const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(UserAdminProfile)

const mapStateToProps = (state: GlobalState, { user, viewer }: RelayProps) => ({
  isSuperAdmin: viewer.isSuperAdmin,
  initialValues: {
    username: user.username ? user.username : null,
    biography: user.biography ? user.biography : null,
    websiteUrl: user.websiteUrl ? user.websiteUrl : null,
    facebookUrl: user.facebookUrl ? user.facebookUrl : null,
    linkedInUrl: user.linkedInUrl ? user.linkedInUrl : null,
    twitterUrl: user.twitterUrl ? user.twitterUrl : null,
    instagramUrl: user.instagramUrl ? user.instagramUrl : null,
    doNotIndexProfile: !user.profilePageIndexed,
    userType: user.userType ? user.userType.id : null,
    neighborhood: user.neighborhood ? user.neighborhood : null,
    media: user ? user.media : undefined,
  },
  userTypes: state.default.userTypes,
  isViewerOrSuperAdmin: user.isViewer || viewer.isSuperAdmin,
})

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(injectIntl(form)) // same as Profile.js I have to find a solution to merge both in one

export default createFragmentContainer(container, {
  user: graphql`
    fragment UserAdminProfile_user on User {
      id
      media {
        id
        name
        size
        url
      }
      url
      username
      biography
      websiteUrl
      facebookUrl
      linkedInUrl
      twitterUrl
      instagramUrl
      profilePageIndexed
      userType {
        id
      }
      neighborhood
      isViewer
    }
  `,
  viewer: graphql`
    fragment UserAdminProfile_viewer on User {
      isSuperAdmin
    }
  `,
})
