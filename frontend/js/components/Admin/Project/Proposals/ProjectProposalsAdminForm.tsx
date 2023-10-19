import React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { FormattedMessage } from 'react-intl'
import { Field } from 'redux-form'
import toggle from '../../../Form/Toggle'
import type { ProjectProposalsAdminForm_project } from '~relay/ProjectProposalsAdminForm_project.graphql'
import { ProjectBoxHeader, ProjectBoxContainer } from '../Form/ProjectAdminForm.style'
import { InformationIcon } from '~/components/Admin/Project/Content/ProjectContentAdminForm'
import Tooltip from '~ds/Tooltip/Tooltip'
import Flex from '~ui/Primitives/Layout/Flex'

type Props = ReduxFormFormProps & {
  project: ProjectProposalsAdminForm_project | null | undefined
  intl: IntlShape
}
export type FormValues = {
  opinionCanBeFollowed: boolean
}

const ActivityInformationIcon: StyledComponent<any, {}, typeof InformationIcon> = styled(props => (
  <InformationIcon {...props} />
))`
  margin-left: 5px;
`

export const ProjectProposalsAdminForm = ({ intl }: Props) => {
  console.log('ok', InformationIcon)

  return (
    <div className="col-md-12">
      <ProjectBoxContainer className="box container-fluid">
        <div className="mt-15">
          <ProjectBoxHeader>
            <h4 className="d-flex align-items-center m-0">
              <div className="mb-15">
                <FormattedMessage id="global.proposals" />
              </div>
            </h4>
          </ProjectBoxHeader>
          <Field
            id="toggle-activity-tracking"
            icons
            component={toggle}
            name="opinionCanBeFollowed"
            normalize={val => !!val}
            label={
              <Flex direction="row" wrap="nowrap">
                {intl.formatMessage({
                  id: 'activity-tracking',
                })}
                <span className="excerpt inline">
                  <Tooltip
                    placement="top"
                    label={intl.formatMessage({
                      id: 'activity-tracking-help-text',
                    })}
                    id="tooltip-description"
                    className="text-left"
                    style={{
                      wordBreak: 'break-word',
                    }}
                  >
                    <div>
                      <ActivityInformationIcon />
                    </div>
                  </Tooltip>
                </span>
              </Flex>
            }
          />
        </div>
      </ProjectBoxContainer>
    </div>
  )
}
export default createFragmentContainer(ProjectProposalsAdminForm, {
  project: graphql`
    fragment ProjectProposalsAdminForm_project on Project @relay(mask: false) {
      opinionCanBeFollowed
    }
  `,
})
