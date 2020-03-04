// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import { OverlayTrigger } from 'react-bootstrap';
import toggle from '../../../Form/Toggle';
import Tooltip from '~/components/Utils/Tooltip';
import type { ProjectProposalsAdminForm_project } from '~relay/ProjectProposalsAdminForm_project.graphql';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectProposalsAdminForm_project,
  intl: IntlShape,
|};

export type FormValues = {|
  opinionCanBeFollowed: boolean,
|};

export const ProjectProposalsAdminForm = ({ intl }: Props) => (
  <div className="col-md-12">
    <div className="box box-primary container-fluid">
      <div className="mt-15">
        <ProjectBoxHeader>
          <h4 className="d-flex align-items-center m-0">
            <div className="mb-15">
              <FormattedMessage id="global.proposals" />
            </div>
          </h4>
        </ProjectBoxHeader>
        <Field
          icons
          component={toggle}
          name="opinionCanBeFollowed"
          normalize={val => !!val}
          label={
            <div>
              {intl.formatMessage({ id: 'activity-tracking' })}
              <span className="excerpt inline">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip
                      id="tooltip-top"
                      className="text-left"
                      style={{ wordBreak: 'break-word' }}>
                      {intl.formatMessage({ id: 'activity-tracking-help-text' })}
                    </Tooltip>
                  }>
                  <i className="fa fa-info-circle ml-5" style={{ opacity: '.5' }} />
                </OverlayTrigger>
              </span>
            </div>
          }
        />
      </div>
    </div>
  </div>
);

export default createFragmentContainer(ProjectProposalsAdminForm, {
  project: graphql`
    fragment ProjectProposalsAdminForm_project on Project @relay(mask: false) {
      opinionCanBeFollowed
    }
  `,
});
