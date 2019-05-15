// @flow
import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import UserGroupModal from './UserGroupModal';
import Tag from '../../Ui/Labels/Tag';
import type { RenderCustomAccess_project } from '~relay/RenderCustomAccess_project.graphql';

type Props = {
  project: RenderCustomAccess_project,
  lockIcon?: ?string,
};
type State = {
  showModal: boolean,
};

export class RenderCustomAccess extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  showModal = () => {
    this.setState({ showModal: true });
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { project, lockIcon } = this.props;
    let nbUserInGroups = 0;
    const lock = lockIcon || 'cap-lock-2';

    if (
      project != null &&
      project.restrictedViewers != null &&
      project.restrictedViewers.totalUserCount != null
    ) {
      nbUserInGroups = project.restrictedViewers.totalUserCount;
    }

    const tooltip = (
      <Tooltip id="tooltip">
        <FormattedMessage id="only-visible-by" values={{ num: nbUserInGroups }} />
      </Tooltip>
    );

    return (
      <React.Fragment>
        <Tag as="button" icon={`cap ${lock} mr-1`} onClick={this.showModal}>
          <OverlayTrigger placement="top" overlay={tooltip}>
            <FormattedMessage id="restrictedaccess" />
          </OverlayTrigger>
        </Tag>
        <div>
          {/* $FlowFixMe */}
          <UserGroupModal
            project={project}
            show={this.state.showModal}
            handleClose={this.hideModal}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(RenderCustomAccess, {
  project: graphql`
    fragment RenderCustomAccess_project on Project {
      restrictedViewers(first: $count, after: $cursor) {
        totalUserCount
      }
      ...UserGroupModal_project @arguments(count: $count, cursor: $cursor)
    }
  `,
});
