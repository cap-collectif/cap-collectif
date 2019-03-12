// @flow
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';

import InlineList from '../Ui/List/InlineList';
import type { ProjectHeaderDistrictsList_project } from './__generated__/ProjectHeaderDistrictsList_project.graphql';

type Props = {
  project: ProjectHeaderDistrictsList_project,
};

type State = {
  show: boolean,
};

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
    const { project } = this.props;
    const { show } = this.state;

    if (project.districts && project.districts.length <= 3) {
      return (
        <InlineList separator="," className="d-i">
          {project.districts.map((district, key) => (
            <li key={key}>{district && district.name}</li>
          ))}
        </InlineList>
      );
    }

    return (
      <div>
        <Button bsStyle="link" onClick={this.handleShow}>
          lorem
        </Button>
        <Modal show={show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default createFragmentContainer(ProjectHeaderDistrictsList, {
  project: graphql`
    fragment ProjectHeaderDistrictsList_project on Project {
      districts {
        name
      }
    }
  `,
});
