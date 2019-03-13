// @flow
import * as React from 'react';
import { Modal, Button, ListGroupItem } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';

import InlineList from '../Ui/List/InlineList';
import ListGroupFlush from '../Ui/List/ListGroupFlush';
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

    if (project.districts) {
      if (project.districts.length <= 3) {
        return (
          <InlineList separator="," className="d-i">
            {project.districts.map((district, key) => (
              <li key={key}>{district && district.name}</li>
            ))}
          </InlineList>
        );
      }

      return (
        <React.Fragment>
          <Button bsStyle="link" onClick={this.handleShow} className="p-0">
            {project.districts[0] && project.districts[0].name}{' '}
            <FormattedMessage
              id="and-count-other-areas"
              values={{
                count: project.districts.length - 1,
              }}
            />
          </Button>
          <Modal show={show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="count-area"
                  values={{
                    count: project.districts.length,
                  }}
                />
              </Modal.Title>
            </Modal.Header>
            <ListGroupFlush>
              {project.districts.map((district, key) => (
                <ListGroupItem key={key}>{district && district.name}</ListGroupItem>
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
        name
      }
    }
  `,
});
