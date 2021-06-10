// @flow
import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import styled from 'styled-components';
import UserGroupModal from './UserGroupModal';
import Tag from '../../Ui/Labels/Tag';
import Tooltip from '../../Utils/Tooltip';
import type { RenderCustomAccess_project } from '~relay/RenderCustomAccess_project.graphql';
import colors from '~/styles/modules/colors';

type Props = {
  project: RenderCustomAccess_project,
  lockIcon?: ?string,
};
type State = {
  showModal: boolean,
};

const StyledTag = styled(Tag)`
  color: ${props => (props.archived ? `${colors['neutral-gray']['500']}` : 'inherit')};
  background: none;
`;

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

    const { showModal } = this.state;

    return (
      <React.Fragment>
        <StyledTag icon={`cap ${lock} mr-1`} onClick={this.showModal} archived={project?.archived}>
          <OverlayTrigger placement="top" overlay={tooltip}>
            <FormattedMessage id="restrictedaccess" />
          </OverlayTrigger>
        </StyledTag>
        <div>
          <UserGroupModal project={project} show={showModal} handleClose={this.hideModal} />
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
      archived
      ...UserGroupModal_project @arguments(count: $count, cursor: $cursor)
    }
  `,
});
