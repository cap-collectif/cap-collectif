// @flow
import * as React from 'react';
import { Modal, Button, ListGroupItem } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

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

    if (project.projectDistrictPositioner && project.projectDistrictPositioner.edges) {
      if (project.projectDistrictPositioner.totalCount <= breakingNumber) {
        return (
          <InlineList separator="," className="d-i">
            {project.projectDistrictPositioner.edges.map((district, key) => (
              <li key={key}>
                {district && district.node && district.node.district && district.node.district.name}
              </li>
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
            className="p-0 project-districts__modal-link">
            {project.projectDistrictPositioner.edges[0] &&
              project.projectDistrictPositioner.edges[0].node &&
              project.projectDistrictPositioner.edges[0].node.district &&
              project.projectDistrictPositioner.edges[0].node.district.name}{' '}
            <FormattedMessage
              id="and-count-other-areas"
              values={{
                count: project.projectDistrictPositioner.totalCount - 1,
              }}
            />
          </DistrictsButton>
          <Modal show={show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="count-area"
                  values={{
                    count: project.projectDistrictPositioner.totalCount,
                  }}
                />
              </Modal.Title>
            </Modal.Header>
            <ListGroupFlush>
              {project.projectDistrictPositioner.edges.map((district, key) => (
                <ListGroupItem key={key}>
                  {district &&
                    district.node &&
                    district.node.district &&
                    district.node.district.name}
                </ListGroupItem>
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
      projectDistrictPositioner {
        totalCount
        edges {
          node {
            district {
              name
            }
            position
          }
        }
      }
    }
  `,
});
