// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import { ListGroup, ListGroupItem, Row, Col, ButtonToolbar } from 'react-bootstrap';
import type { ProjectDistrictsList_districts } from './__generated__/ProjectDistrictsList_districts.graphql';
import EditButton from '../Ui/Button/EditButton';
import DeleteButtonPopover from '../Ui/Button/DeleteButtonPopover';
import AddButton from '../Ui/Button/AddButton';
import ProjectDistrictForm from './ProjectDistrictForm';
import DeleteProjectDistrictMutation from '../../mutations/DeleteProjectDistrictMutation';

type DefaultProps = {
  districts: ProjectDistrictsList_districts,
};

type Props = DefaultProps & {
  relay: RelayRefetchProp,
};

type State = {
  isModalOpen: boolean,
  isCreating: boolean,
  editeDistrictId: ?string,
};

export class ProjectDistrictsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isModalOpen: false,
      isCreating: true,
      editeDistrictId: null,
    };
  }

  openModal = () => {
    this.setState({
      isModalOpen: true,
      editeDistrictId: null,
    });
  };

  closeModal = () => {
    this.setState({
      isModalOpen: false,
      isCreating: true,
      editeDistrictId: null,
    });
  };

  handleCreate = () => {
    this.setState({
      isModalOpen: true,
      isCreating: true,
      editeDistrictId: null,
    });
  };

  handleDelete = (deleteId: string) => {
    const input = {
      id: deleteId,
    };

    DeleteProjectDistrictMutation.commit({ input }).then(() => {
      this._refetch();
    });
  };

  handleEdit = (editeId: string) => {
    this.setState({
      isCreating: false,
      isModalOpen: true,
      editeDistrictId: editeId,
    });
  };

  _refetch = () => {
    const { refetch } = this.props.relay;
    refetch({ refetch: true });
  };

  render() {
    const { districts } = this.props;
    const { isModalOpen, isCreating, editeDistrictId } = this.state;

    return (
      <>
        <ProjectDistrictForm
          member="projectDistrict"
          show={isModalOpen}
          isCreating={isCreating}
          handleClose={this.closeModal}
          handleRefresh={this._refetch}
          district={districts.filter(district => district.id === editeDistrictId).shift()}
        />
        <ListGroup>
          {districts.map(district => (
            <ListGroupItem key={district.id}>
              <Row>
                <Col xs={8}>
                  <strong>{district.name}</strong>
                </Col>
                <Col xs={4}>
                  <ButtonToolbar className="pull-right">
                    <EditButton handleOnClick={() => this.handleEdit(district.id)} />
                    <DeleteButtonPopover handleValidate={() => this.handleDelete(district.id)} />
                  </ButtonToolbar>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
        <AddButton handleOnClick={this.handleCreate} />
      </>
    );
  }
}

export default createRefetchContainer(
  ProjectDistrictsList,
  {
    districts: graphql`
      fragment ProjectDistrictsList_districts on ProjectDistrict @relay(plural: true) {
        id
        name
        geojson
        displayedOnMap
        border {
          isEnable
          color
          opacity
          size
        }
        background {
          isEnable
          color
          opacity
        }
      }
    `,
  },
  graphql`
    query ProjectDistrictsListQuery {
      districts: projectDistricts {
        ...ProjectDistrictsList_districts
      }
    }
  `,
);
