// @flow
import React from 'react';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { Field, formValueSelector } from 'redux-form';
import toggle from '~/components/Form/Toggle';
import colors from '~/utils/colors';
import renderComponent from '~/components/Form/Field';
import type { Dispatch } from '~/types';
import type { ProjectExternalAdminForm_project } from '~relay/ProjectExternalAdminForm_project.graphql';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectExternalAdminForm_project,
  intl: IntlShape,
  formName: string,
  dispatch: Dispatch,
  isExternal: boolean,
|};

export type FormValues = {|
  isExternal: boolean,
  externalLink: string,
  externalParticipantsCount: ?number,
  externalContributionsCount: ?number,
  externalVotesCount: ?number,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .info {
    color: ${colors.gray};
  }
`;

export const validate = ({
  externalParticipantsCount,
  externalContributionsCount,
  externalVotesCount,
  isExternal,
  externalLink,
}: FormValues) => {
  const errors = {};

  if (isExternal && !externalLink) {
    errors.externalLink = 'available-external-link-required';
  }
  if (externalParticipantsCount && externalParticipantsCount < 0) {
    errors.externalParticipantsCount = 'global.constraints.notNegative';
  }

  if (externalContributionsCount && externalContributionsCount < 0) {
    errors.externalContributionsCount = 'global.constraints.notNegative';
  }

  if (externalVotesCount && externalVotesCount < 0) {
    errors.externalVotesCount = 'global.constraints.notNegative';
  }

  return errors;
};

export function ProjectExternalAdminForm(props: Props) {
  const { isExternal } = props;

  return (
    <div className="mt-15">
      <ProjectBoxHeader noBorder>
        <h4 className="d-flex align-items-center m-0">
          <Field icons component={toggle} name="isExternal" normalize={val => !!val} />
          <div className="mb-15">
            <FormattedMessage id="admin.fields.project.group_external" />
          </div>
        </h4>
      </ProjectBoxHeader>
      {isExternal ? (
        <Container>
          <div className="mb-15 info">
            <FormattedMessage id="counters-not-recorded-on-platform" />
          </div>
          <Field
            type="text"
            name="externalLink"
            label={<FormattedMessage id="admin.fields.project.externalLink" />}
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
                <FormattedMessage id="project.sort.contributions_nb" />
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
                <FormattedMessage id="global.vote.count.label" />
                <div className="excerpt inline">
                  <FormattedMessage id="global.optional" />
                </div>
              </div>
            }
            component={renderComponent}
          />
        </Container>
      ) : null}
    </div>
  );
}

/*
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



const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectExternalAdminForm),
);
*/

const mapStateToProps = (state, { project, formName }: Props) => ({
  initialValues: {
    isExternal: project ? project.isExternal : false,
    externalLink: project ? project.externalLink : null,
    externalVotesCount: project ? project.externalVotesCount : null,
    externalContributionsCount: project ? project.externalContributionsCount : null,
    externalParticipantsCount: project ? project.externalParticipantsCount : '',
  },
  isExternal: formValueSelector(formName)(state, 'isExternal') || false,
});

const connector = connect(mapStateToProps)(ProjectExternalAdminForm);

export default createFragmentContainer(connector, {
  project: graphql`
    fragment ProjectExternalAdminForm_project on Project {
      id
      isExternal
      externalLink
      externalContributionsCount
      externalParticipantsCount
      externalVotesCount
    }
  `,
});
