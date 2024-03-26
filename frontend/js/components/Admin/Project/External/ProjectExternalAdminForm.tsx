import React from 'react'
import { connect } from 'react-redux'

import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { FormattedMessage } from 'react-intl'
import { Field, formValueSelector } from 'redux-form'
import toggle from '~/components/Form/Toggle'
import colors from '~/utils/colors'
import renderComponent from '~/components/Form/Field'
import type { Dispatch } from '~/types'
import type { ProjectExternalAdminForm_project } from '~relay/ProjectExternalAdminForm_project.graphql'
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style'

type Props = ReduxFormFormProps & {
  project: ProjectExternalAdminForm_project | null | undefined
  intl: IntlShape
  formName: string
  dispatch: Dispatch
  isExternal: boolean
}
export type FormValues = {
  isExternal: boolean
  externalLink: string
  externalParticipantsCount: number | null | undefined
  externalContributionsCount: number | null | undefined
  externalVotesCount: number | null | undefined
}
const Container = styled.div`
  .info {
    color: ${colors.gray};
  }
`
export const validate = ({
  externalParticipantsCount,
  externalContributionsCount,
  externalVotesCount,
  isExternal,
  externalLink,
}: FormValues) => {
  const errors: any = {}

  if (isExternal && !externalLink) {
    errors.externalLink = 'available-external-link-required'
  }

  if (externalParticipantsCount && externalParticipantsCount < 0) {
    errors.externalParticipantsCount = 'global.constraints.notNegative'
  }

  if (externalContributionsCount && externalContributionsCount < 0) {
    errors.externalContributionsCount = 'global.constraints.notNegative'
  }

  if (externalVotesCount && externalVotesCount < 0) {
    errors.externalVotesCount = 'global.constraints.notNegative'
  }

  return errors
}
export function ProjectExternalAdminForm(props: Props) {
  const { isExternal } = props
  return (
    <div className="mt-15">
      <ProjectBoxHeader noBorder>
        <h4 className="d-flex align-items-center m-0">
          <Field
            id="toggle-isExternal"
            icons
            component={toggle}
            name="isExternal"
            normalize={val => !!val}
            label={
              <div className="mb-15">
                <FormattedMessage id="admin.fields.project.group_external" />
              </div>
            }
          />
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
  )
}

const mapStateToProps = (state, { project, formName }: Props) => ({
  initialValues: {
    isExternal: project ? project.isExternal : false,
    externalLink: project ? project.externalLink : null,
    externalVotesCount: project ? project.externalVotesCount : null,
    externalContributionsCount: project ? project.externalContributionsCount : null,
    externalParticipantsCount: project ? project.externalParticipantsCount : '',
  },
  isExternal: formValueSelector(formName)(state, 'isExternal') || false,
})

const connector = connect(mapStateToProps)(ProjectExternalAdminForm)
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
})
