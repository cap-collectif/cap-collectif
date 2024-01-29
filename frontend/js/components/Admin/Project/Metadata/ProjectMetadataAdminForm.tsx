import React from 'react'
import { connect } from 'react-redux'
import { Field } from 'redux-form'
import { createFragmentContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { injectIntl, FormattedMessage } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import type { ProjectMetadataAdminForm_project } from '~relay/ProjectMetadataAdminForm_project.graphql'
import '~relay/ProjectMetadataAdminForm_project.graphql'
import component from '~/components/Form/Field'
import select from '~/components/Form/Select'
import environment from '~/createRelayEnvironment'

export type Props = ReduxFormFormProps & {
  project: ProjectMetadataAdminForm_project | null | undefined
  intl: IntlShape
  formName: string
}
type Option = {
  value: string
  label: string
}
export type FormValues = {
  publishedAt: string
  themes: Option[]
  cover:
    | {
        id: string
        description: string | null | undefined
        name: string | null | undefined
        size: string | null | undefined
        url: string | null | undefined
      }
    | null
    | undefined
  video: string | null | undefined
  districts: Option[]
}

const formatOption = (options: Option[]): string[] => options.map(option => option.value)

const getDistrictList = graphql`
  query ProjectMetadataAdminFormDistrictQuery($name: String) {
    globalDistricts(name: $name) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`
const getThemeOptions = graphql`
  query ProjectMetadataAdminFormThemeQuery($title: String) {
    themes(title: $title) {
      id
      title
    }
  }
`
export const formatInput = ({ publishedAt, themes, cover, video, districts }: FormValues) => {
  if (publishedAt && typeof publishedAt !== 'string' && !(publishedAt instanceof String)) {
    publishedAt = publishedAt.format('YYYY-MM-DD HH:mm:ss')
  }

  const input = {
    publishedAt,
    cover: cover ? cover.id : null,
    video,
    districts: formatOption(districts),
    themes: formatOption(themes),
  }
  return input
}
const Wrapper: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  color: #000;

  .published-at-container {
    width: 50%;
  }
`
const VideoTextSpan: StyledComponent<any, {}, HTMLSpanElement> = styled.span`
  display: block;
  margin-top: 5px;
  margin-bottom: 10px;
  color: #737373;
`
export const validate = ({ publishedAt }: FormValues) => {
  const errors: any = {}

  if (publishedAt === null) {
    errors.publishedAt = 'global.constraints.notBlank'
  }

  return errors
}
const formName = 'project-metadata-admin-form'
export const loadThemeOptions = (search: string | null | undefined) => {
  return fetchQuery_DEPRECATED(environment, getThemeOptions, {
    title: search,
  }).then(data => {
    return data.themes.map(u => ({
      value: u.id,
      label: u.title,
    }))
  })
}
export const loadDistrictOptions = (search: string | null | undefined) => {
  return fetchQuery_DEPRECATED(environment, getDistrictList, {
    name: search,
  }).then(data => {
    return (
      data.globalDistricts.edges &&
      data.globalDistricts.edges
        .filter(d => d.node)
        .map(d => {
          if (d.node) {
            return {
              value: d.node.id,
              label: d.node.name,
            }
          }
        })
    )
  })
}
export const ProjectMetadataAdminForm = (props: Props) => {
  const { handleSubmit } = props
  return (
    <Wrapper>
      <form onSubmit={handleSubmit} id={formName}>
        <Field
          id="publishedAt"
          component={component}
          type="datetime"
          name="publishedAt"
          formName={formName}
          label={
            <div>
              <FormattedMessage id="global.publication" />
              <span className="excerpt inline">
                <FormattedMessage id="global.mandatory" />
              </span>
            </div>
          }
          addonAfter={<i className="cap-calendar-2" />}
        />

        <Field
          selectFieldIsObject
          debounce
          autoload
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          component={select}
          id="themes"
          name="themes"
          placeholder={<FormattedMessage id="global.themes" />}
          label={<FormattedMessage id="global.themes" />}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          loadOptions={loadThemeOptions}
          multi
          clearable
        />

        <div className="row mr-0 ml-0">
          <Field
            id="cover"
            name="cover"
            component={component}
            type="image"
            image={null}
            label={<FormattedMessage id="proposal.media" />}
          />
        </div>

        <Field
          type="text"
          name="video"
          id="video"
          label={
            <span className="project-video">
              <FormattedMessage id="admin.fields.project.video" />
            </span>
          }
          component={component}
        />

        <VideoTextSpan className="mt-0 mb-15">
          <FormattedMessage id="admin.help.project.video" />
        </VideoTextSpan>

        <Field
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          loadOptions={loadDistrictOptions}
          component={select}
          id="districts"
          name="districts"
          clearable
          selectFieldIsObject
          debounce
          autoload
          multi
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          placeholder="Choisir un district"
          label={
            <div>
              <FormattedMessage id="proposal_form.districts" />
            </div>
          }
        />
      </form>
    </Wrapper>
  )
}

const mapStateToProps = (state, { project }: Props) => ({
  initialValues: {
    themes: project
      ? project.themes &&
        project.themes.map(theme => {
          return theme
        })
      : [],
    video: project ? project.video : null,
    cover: project ? project.cover : null,
    districts: project
      ? project &&
        project.districts &&
        project.districts.edges &&
        project.districts.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(d => {
            return {
              value: d.value,
              label: d.label,
            }
          })
      : [],
    publishedAt: project ? project.publishedAt : null,
  },
})

export // @ts-ignore
const container = connect<any, any>(mapStateToProps)(ProjectMetadataAdminForm)
export default createFragmentContainer(injectIntl(container), {
  project: graphql`
    fragment ProjectMetadataAdminForm_project on Project {
      id
      title
      publishedAt
      cover: cover {
        id
        name
        size
        url
      }
      video
      themes {
        value: id
        label: title
      }
      districts {
        edges {
          node {
            value: id
            label: name
          }
        }
      }
    }
  `,
})
