// @flow
import React, { type ComponentType } from 'react';
import { Field } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { useSelector } from 'react-redux';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import UserListField from '../../Field/UserListField';
import { type Author } from '../Form/ProjectAdminForm';
import ProjectTypeListField from '../../Field/ProjectTypeListField';
import { type ProjectContentAdminForm_project } from '~relay/ProjectContentAdminForm_project.graphql';
import { loadDistrictOptions, loadThemeOptions } from '../Metadata/ProjectMetadataAdminForm';
import {
  ProjectBoxHeader,
  ProjectSmallInput,
  ProjectBoxContainer,
} from '../Form/ProjectAdminForm.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { clearToasts } from '~ds/Toast';
import type { GlobalState } from '~/types';
import Text from '~ui/Primitives/Text';
import Tooltip from '~ds/Tooltip/Tooltip';
import Flex from '~ui/Primitives/Layout/Flex';
import type { AddressComplete } from '~/components/Form/Address/Address.type';

type Option = {|
  value: string,
  label: string,
|};

export type FormValues = {|
  title: string,
  authors: Author[],
  projectType: string,
  themes: Option[],
  cover: ?{
    id: string,
    description: ?string,
    name: ?string,
    size: ?string,
    url: ?string,
  },
  metaDescription: ?string,
  video: ?string,
  districts: Option[],
  address?: ?string,
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

export const renderLabel = (
  id: string,
  intl: IntlShape,
  helpText?: string,
  optional?: boolean,
  labelWeight?: string,
) => (
  <Flex direction="row" wrap="nowrap">
    <Text as="span" fontWeight={labelWeight || 'bold'}>
      {intl.formatMessage({ id })}
    </Text>
    <Flex
      as="span"
      direction="row"
      wrap="nowrap"
      align="center"
      color="gray.500"
      fontWeight="normal"
      marginLeft={1}>
      {optional ? intl.formatMessage({ id: 'global.optional' }) : null}
      {helpText && (
        <Tooltip
          placement="top"
          label={intl.formatMessage({ id: helpText })}
          id="tooltip-top"
          className="text-left"
          style={{ wordBreak: 'break-word' }}>
          <Flex marginLeft={1}>
            <InformationIcon />
          </Flex>
        </Tooltip>
      )}
    </Flex>
  </Flex>
);

export const validate = (props: FormValues) => {
  const { title, authors, metaDescription } = props;
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!authors || authors.length <= 0) {
    errors.authors = 'global.required';
  }

  const METADESCRIPTION_MAX_LENGTH = 160;
  if (metaDescription && metaDescription.length > METADESCRIPTION_MAX_LENGTH) {
    errors.metaDescription = {
      id: 'characters-maximum-required',
      values: {
        length: METADESCRIPTION_MAX_LENGTH
      }
    }
  }

  return errors;
};

export const ProjectContentAdminForm = ({ intl, change }: Props) => {
  const { user } = useSelector((state: GlobalState) => state.user);
  const isAdmin = user ? user.isAdmin : false;
  React.useEffect(() => {
    clearToasts();
  });
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
          {isAdmin && (
            <UserListField
              id="project-author"
              name="authors"
              clearable
              selectFieldIsObject
              debounce
              autoload
              multi
              placeholder=" "
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              label={<FormattedMessage id="admin.fields.project.authors" />}
              ariaControls="EventListFilters-filter-author-listbox"
            />
          )}
          <ProjectSmallInput>
            <ProjectTypeListField optional placeholder=" " />
          </ProjectSmallInput>
          <div className="row mr-0 ml-0">
            <Field
              id="cover"
              name="cover"
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
            id="address"
            component={renderComponent}
            type="address"
            name="addressText"
            label={<FormattedMessage id="proposal_form.address" />}
            placeholder="proposal.map.form.placeholder"
            addressProps={{
              getAddress: (addressComplete: ?AddressComplete) =>
                change(
                  'address',
                  addressComplete ? JSON.stringify([addressComplete]) : addressComplete,
                ),
            }}
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
      address {
        formatted
        json
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
