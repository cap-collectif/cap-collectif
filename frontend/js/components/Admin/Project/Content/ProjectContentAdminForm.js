// @flow
import React, { type ComponentType } from 'react';
import { Field } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import { OverlayTrigger } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage, type IntlShape } from 'react-intl';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import UserListField from '../../Field/UserListField';
import { type Author } from '../Form/ProjectAdminForm';
import ProjectTypeListField from '../../Field/ProjectTypeListField';
import { type ProjectContentAdminForm_project } from '~relay/ProjectContentAdminForm_project.graphql';
import { loadDistrictOptions, loadThemeOptions } from '../Metadata/ProjectMetadataAdminForm';
import Tooltip from '~/components/Utils/Tooltip';
import {
  ProjectBoxHeader,
  ProjectSmallInput,
  ProjectBoxContainer,
} from '../Form/ProjectAdminForm.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Option = {|
  value: string,
  label: string,
|};

export type FormValues = {|
  title: string,
  authors: Author[],
  projectType: string,
  themes: Option[],
  Cover: ?{
    id: string,
    description: ?string,
    name: ?string,
    size: ?string,
    url: ?string,
  },
  metaDescription: ?string,
  video: ?string,
  districts: Option[],
|};

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectContentAdminForm_project,
  intl: IntlShape,
|};

export const InformationIcon: StyledComponent<{}, {}, ComponentType<any>> = styled(Icon).attrs({
  name: ICON_NAME.information,
  size: '12px',
  style: undefined, // Override default styles that `Icon` component apply
})`
  opacity: 0.3;
  position: relative;
  top: 1px;
`;

export const renderLabel = (id: string, intl: IntlShape, helpText?: string, optional?: boolean) => (
  <div>
    {intl.formatMessage({ id })}
    <span className="excerpt inline">
      {!optional && intl.formatMessage({ id: 'global.optional' })}{' '}
      {helpText && (
        <OverlayTrigger
          key="top"
          placement="top"
          overlay={
            <Tooltip id="tooltip-top" className="text-left" style={{ wordBreak: 'break-word' }}>
              <FormattedHTMLMessage id={helpText} />
            </Tooltip>
          }>
          <InformationIcon />
        </OverlayTrigger>
      )}
    </span>
  </div>
);

export const validate = (props: FormValues) => {
  const { title, authors } = props;
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!authors || authors.length <= 0) {
    errors.authors = 'global.required';
  }

  return errors;
};

export const ProjectContentAdminForm = ({ intl }: Props) => {
  return (
    <div className="col-md-12">
      <ProjectBoxContainer className="box container-fluid">
        <ProjectBoxHeader>
          <h4>
            <FormattedMessage id="global.general" />
          </h4>
        </ProjectBoxHeader>
        <div className="box-content">
          <Field
            type="text"
            name="title"
            label={<FormattedMessage id="global.title" />}
            component={renderComponent}
          />
          <UserListField
            id="project-author"
            name="authors"
            clearable
            selectFieldIsObject
            debounce
            autoload={false}
            multi
            placeholder=" "
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            label={<FormattedMessage id="admin.fields.project.authors" />}
            ariaControls="EventListFilters-filter-author-listbox"
          />

          <ProjectSmallInput>
            <ProjectTypeListField optional placeholder=" " />
          </ProjectSmallInput>
          <div className="row mr-0 ml-0">
            <Field
              id="cover"
              name="Cover"
              component={renderComponent}
              type="image"
              label={renderLabel('proposal.media', intl)}
            />
          </div>
          <Field
            type="text"
            name="video"
            id="video"
            label={renderLabel('admin.fields.project.video', intl, 'admin.help.project.video')}
            placeholder={intl.formatMessage({ id: 'admin-project-video-placeholder' })}
            component={renderComponent}
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
            placeholder=" "
            label={renderLabel('global.themes', intl)}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            loadOptions={loadThemeOptions}
            multi
            clearable
          />
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
            label={renderLabel('proposal_form.districts', intl)}
          />
          <Field
            name="metaDescription"
            type="textarea"
            label={renderLabel('global.meta.description', intl, 'admin.help.metadescription')}
            component={renderComponent}
          />
        </div>
      </ProjectBoxContainer>
    </div>
  );
};

export default createFragmentContainer(ProjectContentAdminForm, {
  project: graphql`
    fragment ProjectContentAdminForm_project on Project {
      id
      title
      metaDescription
      authors {
        value: id
        label: username
      }
      type {
        id
      }
      Cover: cover {
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
});
