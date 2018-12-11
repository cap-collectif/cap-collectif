// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { ListGroup, ListGroupItem, Row, Col, ButtonToolbar } from 'react-bootstrap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import EditButton from '../Ui/Button/EditButton';
import DeleteButtonPopover from '../Ui/Button/DeleteButtonPopover';
import AddButton from '../Ui/Button/AddButton';
import type { ProjectDistrictAdminPageQueryResponse } from './__generated__/ProjectDistrictAdminPageQuery.graphql';
import ProjectDistrictForm from './ProjectDistrictForm';
import DeleteProjectDistrictMutation from '../../mutations/DeleteProjectDistrictMutation';

type Props = {};

type State = {
  isModalOpen: boolean,
  isCreating: boolean,
  editDistrictId: ?string,
};

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

  handleEdit = (editeId: string) => {
    this.setState({
      isCreating: false,
      isModalOpen: true,
      editDistrictId: editeId,
    });
  };

  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectDistrictAdminPageQuery {
            districts: projectDistricts(first: 1000)
              @connection(key: "ProjectDistrictAdminPage_districts") {
              edges {
                node {
                  id
                  name
                  geojson
                  displayedOnMap
                  border {
                    enabled
                    color
                    opacity
                    size
                  }
                  background {
                    enabled
                    color
                    opacity
                  }
                }
              }
            }
          }
        `}
        variables={{}}
        render={({
          error,
          props,
        }: { props: ?ProjectDistrictAdminPageQueryResponse } & ReadyState) => {
          if (error) {
            return graphqlError;
          }

          if (!props) {
            return <Loader />;
          }
          const { isModalOpen, isCreating, editDistrictId } = this.state;

          return (
            <div className="box box-primary container-fluid pb-15">
              <h3 className="box-title">
                <FormattedMessage id="proposal_form.districts" />
              </h3>
              <hr />
              <ProjectDistrictForm
                member="projectDistrict"
                show={isModalOpen}
                isCreating={isCreating}
                handleClose={this.closeModal}
                district={
                  props.districts.edges &&
                  props.districts.edges
                    .filter(Boolean)
                    .map(edge => edge.node)
                    .filter(Boolean)
                    .filter(district => district.id === editDistrictId)
                    .shift()
                }
              />
              <ListGroup>
                {props.districts.edges &&
                  props.districts.edges
                    .filter(Boolean)
                    .map(edge => edge.node)
                    .filter(Boolean)
                    .map(district => (
                      <ListGroupItem key={district.id}>
                        <Row>
                          <Col xs={6} sm={7}>
                            <strong>{district.name}</strong>
                          </Col>
                          <Col xs={6} sm={5}>
                            <ButtonToolbar className="pull-right">
                              <EditButton onClick={() => this.handleEdit(district.id)} />
                              <DeleteButtonPopover
                                handleValidate={() => this.handleDelete(district.id)}
                              />
                            </ButtonToolbar>
                          </Col>
                        </Row>
                      </ListGroupItem>
                    ))}
              </ListGroup>
              <AddButton onClick={this.handleCreate} />
            </div>
          );
        }}
      />
    );
  }
}

export default ProjectDistrictAdminPage;
