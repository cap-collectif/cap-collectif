// @flow
import React from 'react';
import { Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { type IntlShape, FormattedMessage } from 'react-intl';
import renderComponent from '~/components/Form/Field';
import { type ProjectPublishAdminForm_project } from '~relay/ProjectPublishAdminForm_project.graphql';
import { ProjectBoxHeader, ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';

export type FormValues = {|
  publishedAt: string,
|};

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectPublishAdminForm_project,
  intl: IntlShape,
|};

export const validate = (props: FormValues) => {
  const { publishedAt } = props;
  const errors = {};

  if (publishedAt === null) {
    errors.publishedAt = 'global.constraints.notBlank';
  }

  return errors;
};

export const ProjectPublishAdminForm = ({ project }: Props) => (
  <div className="col-md-12">
    <div className="box box-primary container-fluid">
      <ProjectBoxHeader>
        <h4>
          <FormattedMessage id="global.publication" />
        </h4>
      </ProjectBoxHeader>
      <div className="box-content">
        <ProjectSmallFieldsContainer>
          <Field
            label={<FormattedMessage id="global.date.text" />}
            id="project-publishedAt"
            name="publishedAt"
            type="datetime"
            component={renderComponent}
            addonAfter={<i className="cap-calendar-2" />}
          />
        </ProjectSmallFieldsContainer>
        <p>
          <strong>
            <FormattedMessage id="permalink" /> :
          </strong>{' '}
          <a href={project?.url} target="blank">
            {project?.url}
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default createFragmentContainer(ProjectPublishAdminForm, {
  project: graphql`
    fragment ProjectPublishAdminForm_project on Project @relay(mask: false) {
      publishedAt
      url
    }
  `,
});
