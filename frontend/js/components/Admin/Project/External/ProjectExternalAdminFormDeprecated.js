// @flow
import React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { Button } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector, SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import styled from 'styled-components';
import renderComponent from '~/components/Form/Field';
import type { ProjectExternalAdminFormDeprecated_project } from '~relay/ProjectExternalAdminFormDeprecated_project.graphql';
import AlertForm from '~/components/Alert/AlertForm';
import type { Dispatch, FeatureToggle, FeatureToggles } from '~/types';
import UpdateProjectMutation from '~/mutations/UpdateProjectMutation';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '~/constants/AlertConstants';
import toggle from '../../../Form/Toggle';
import colors from '../../../../utils/colors';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectExternalAdminFormDeprecated_project,
  intl: IntlShape,
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
  formName: string,
  dispatch: Dispatch,
  isExternal: boolean,
  hostUrl: string,
|};

type FormValues = {|
  isExternal: boolean,
  externalLink: string,
  externalParticipantsCount: ?number,
  externalContributionsCount: ?number,
  externalVotesCount: ?number,
|};

const Container = styled.div`
  .info {
    color: ${colors.gray};
  }
`;
const formName = 'ProjectExternalAdminFormDeprecated';

export function ProjectExternalAdminFormDeprecated(props: Props) {
  const {
    handleSubmit,
    valid,
    invalid,
    submitting,
    pristine,
    submitSucceeded,
    submitFailed,
    isExternal,
  } = props;

  return (
    <form onSubmit={handleSubmit} id={formName} className="mt-15">
      <h4 className="box-title d-flex align-items-center m-0">
        <Field icons component={toggle} name="isExternal" normalize={val => !!val} />
        <div className="mb-15">
          <FormattedMessage id="admin.fields.project.group_external" />
        </div>
      </h4>

      {isExternal ? (
        <Container>
          <div className="mb-15 info">
            <FormattedMessage id="counters-not-recorded-on-platform" />
          </div>
          <Field
            type="text"
            name="externalLink"
            label={
              <div>
                <FormattedMessage id="admin.fields.project.externalLink" />
              </div>
            }
            placeholder="https://"
            component={renderComponent}
          />

          <Field
            type="number"
            min={0}
            normalize={val => (val && !Number.isNaN(parseInt(val, 10)) ? parseInt(val, 10) : null)}
            name="externalParticipantsCount"
            label={
              <div>
                <FormattedMessage id="admin.fields.project.participantsCount" />
                <div className="excerpt inline">
                  <FormattedMessage id="global.optional" />
                </div>
              </div>
            }
            component={renderComponent}
          />

          <Field
            type="number"
            min={0}
            normalize={val => (val && !Number.isNaN(parseInt(val, 10)) ? parseInt(val, 10) : null)}
            name="externalContributionsCount"
            label={
              <div>
                <FormattedMessage id='project.sort.contributions_nb' />
                <div className="excerpt inline">
                  <FormattedMessage id="global.optional" />
                </div>
              </div>
            }
            component={renderComponent}
          />

          <Field
            type="number"
            min={0}
            name="externalVotesCount"
            normalize={val => (val && !Number.isNaN(parseInt(val, 10)) ? parseInt(val, 10) : null)}
            label={
              <div>
                <FormattedMessage id='global.vote.count.label' />
                <div className="excerpt inline">
                  <FormattedMessage id="global.optional" />
                </div>
              </div>
            }
            component={renderComponent}
          />

          <Button
            id="submit-project-content"
            type="submit"
            disabled={invalid || submitting || pristine}
            bsStyle="primary">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save" />
            )}
          </Button>
          <AlertForm
            valid={valid}
            invalid={invalid && !pristine}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
        </Container>
      ) : null}
    </form>
  );
}

const onSubmit = (
  {
    externalLink,
    externalContributionsCount,
    externalParticipantsCount,
    externalVotesCount,
    isExternal,
  }: FormValues,
  dispatch: Dispatch,
  props: Props,
) => {
  const { project, hostUrl } = props;

  const input = {
    isExternal,
    externalLink,
    externalContributionsCount,
    externalParticipantsCount,
    externalVotesCount,
  };

  if (!externalLink || externalLink.length === 0) {
    throw new SubmissionError({ externalLink: 'fill-field' });
  } else if (externalLink.toLowerCase().indexOf(hostUrl) !== -1) {
    throw new SubmissionError({ externalLink: 'available-external-link-required' });
  }
  if (project) {
    return UpdateProjectMutation.commit({
      input: {
        id: project.id,
        ...input,
      },
    }).then(data => {
      if (data.updateProject && data.updateProject.project) {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.report.argument' },
        });
      }
    });
  }
  return null;
};

const validate = () => {
  return {};
};

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectExternalAdminFormDeprecated),
);

const mapStateToProps = (state, { project }: Props) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  isExternal: formValueSelector(formName)(state, 'isExternal') ?? false,
  initialValues: {
    isExternal: project ? project.isExternal : false,
    externalLink: project ? project.externalLink : null,
    externalVotesCount: project ? project.externalVotesCount : null,
    externalContributionsCount: project ? project.externalContributionsCount : null,
    externalParticipantsCount: project ? project.externalParticipantsCount : '',
  },
});

const connector = connect(mapStateToProps)(form);

export default createFragmentContainer(connector, {
  project: graphql`
    fragment ProjectExternalAdminFormDeprecated_project on Project {
      id
      isExternal
      externalLink
      externalContributionsCount
      externalParticipantsCount
      externalVotesCount
    }
  `,
});
