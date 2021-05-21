// @flow
import * as React from 'react';
import { Modal, Button, ListGroupItem } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import colors from '~/styles/modules/colors';

import InlineList from '../Ui/List/InlineList';
import ListGroupFlush from '../Ui/List/ListGroupFlush';
import type { ProjectHeaderDistrictsList_project } from '~relay/ProjectHeaderDistrictsList_project.graphql';

type Props = {|
  +breakingNumber: number,
  +fontSize: number,
  +project: ProjectHeaderDistrictsList_project,
|};

type State = {|
  +show: boolean,
|};

const DistrictsButton = styled(Button)`
  font-size: ${props => props.fontSize}px;
  padding: 0;
  vertical-align: baseline;
  color: ${props => props.archived ? `${colors['neutral-gray']['500']} !important` : null}
`;

export class ProjectHeaderDistrictsList extends React.Component<Props, State> {
  state = {
    show: false,
  };

  handleClose = () => {
    this.setState({ show: false });
  };

  handleShow = () => {
    this.setState({ show: true });
  };

  render() {
    const { project, breakingNumber, fontSize } = this.props;
    const { show } = this.state;

    if (project.districts && project.districts.edges) {
      if (project.districts.totalCount <= breakingNumber) {
        return (
          <InlineList className="d-i" separator="•">
            {project.districts.edges.map((district, key) => (
              <li key={key}>{district?.node?.name}</li>
            ))}
          </InlineList>
        );
      }

      return (
        <React.Fragment>
          <DistrictsButton
            fontSize={fontSize}
            bsStyle="link"
            onClick={this.handleShow}
            className="p-0 project-districts__modal-link"
            archived={project.archived}
          >
            {project.districts.edges[0]?.node?.name}{' '}
            <FormattedMessage
              id="and-count-other-areas"
              values={{
                count: project.districts.totalCount - 1,
              }}
            />
          </DistrictsButton>
          <Modal show={show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="count-area"
                  values={{
                    count: project.districts.totalCount,
                  }}
                />
              </Modal.Title>
            </Modal.Header>
            <ListGroupFlush>
              {project.districts.edges.map((district, key) => (
                <ListGroupItem key={key}>{district?.node?.name}</ListGroupItem>
              ))}
            </ListGroupFlush>
          </Modal>
        </React.Fragment>
      );
    }

    return null;
  }
}

export default createFragmentContainer(ProjectHeaderDistrictsList, {
  project: graphql`
    fragment ProjectHeaderDistrictsList_project on Project {
      districts {
        totalCount
        edges {
          node {
            name
          }
        }
      }
      archived
    }
  `,
});
