// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';

import { connect } from 'react-redux';
import AddButton from '~/components/Ui/Button/AddButton';
import ProjectDistrictForm from './ProjectDistrictForm';
import ProjectDistrictAdminList from './ProjectDistrictAdminList';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';
import DeleteProjectDistrictMutation from '~/mutations/DeleteProjectDistrictMutation';
import type { ProjectDistrictAdminPage_districts } from '~relay/ProjectDistrictAdminPage_districts.graphql';
import type { FeatureToggles, State as GlobalState } from '~/types';

type Props = {|
  districts: ProjectDistrictAdminPage_districts,
  features: FeatureToggles,
|};

type State = {|
  isModalOpen: boolean,
  isCreating: boolean,
  editDistrictId: ?string,
|};

const PageTitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export class ProjectDistrictAdminPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isModalOpen: false,
      isCreating: true,
      editDistrictId: null,
    };
  }

  openModal = () => {
    this.setState({
      isModalOpen: true,
      editDistrictId: null,
    });
  };

  closeModal = () => {
    this.setState({
      isModalOpen: false,
      isCreating: true,
      editDistrictId: null,
    });
  };

  handleCreate = () => {
    this.setState({
      isModalOpen: true,
      isCreating: true,
      editDistrictId: null,
    });
  };

  handleDelete = (deleteId: string) => {
    const input = {
      id: deleteId,
    };

    DeleteProjectDistrictMutation.commit({ input });
  };

  handleEdit = (editedId: string) => {
    this.setState({
      isCreating: false,
      isModalOpen: true,
      editDistrictId: editedId,
    });
  };

  render() {
    const { isModalOpen, isCreating, editDistrictId } = this.state;
    const { districts, features } = this.props;

    return (
      <div className="box box-primary container-fluid pb-15">
        <PageTitleContainer>
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.districts" />
          </h3>
          <span className="mr-30 mt-15">
            {features.unstable__multilangue && <LanguageButtonContainer />}
          </span>
        </PageTitleContainer>
        <hr />
        <ProjectDistrictForm
          member="projectDistrict"
          show={isModalOpen}
          isCreating={isCreating}
          handleClose={this.closeModal}
          district={
            districts.edges &&
            districts.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .find(district => district.id === editDistrictId)
          }
          features
        />
        <ProjectDistrictAdminList
          districts={districts}
          handleDelete={this.handleDelete}
          handleEdit={this.handleEdit}
        />
        <AddButton onClick={this.handleCreate} />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(
  createFragmentContainer(ProjectDistrictAdminPage, {
    districts: graphql`
      fragment ProjectDistrictAdminPage_districts on ProjectDistrictConnection {
        edges {
          node {
            id
            ...ProjectDistrictForm_district
          }
        }
        ...ProjectDistrictAdminList_districts
      }
    `,
  }),
);
