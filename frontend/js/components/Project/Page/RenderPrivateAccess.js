// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import styled from 'styled-components';
import Tooltip from '../../Utils/Tooltip';
import Tag from '../../Ui/Labels/Tag';
import type { RenderPrivateAccess_project } from '~relay/RenderPrivateAccess_project.graphql';
import colors from '~/styles/modules/colors';

type Props = {
  project: RenderPrivateAccess_project,
  lockIcon?: ?string,
};

const StyledTag = styled(Tag)`
  color: ${props => (props.archived ? `${colors['neutral-gray']['500']}` : 'inherit')};
`;

export class RenderPrivateAccess extends React.Component<Props> {
  render() {
    const { project, lockIcon } = this.props;
    let visibleBy = 'global.draft.only_visible_by_you';
    const lock = lockIcon || 'cap-lock-2';
    if (project && project.visibility && project.visibility === 'ADMIN') {
      visibleBy = 'only-visible-by-administrators';
    }

    const tooltip = (
      <Tooltip id="tooltip">
        <FormattedMessage id={visibleBy} />
      </Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <StyledTag archived={project.archived} icon={`cap ${lock} mr-1`}>
          <FormattedMessage id="restrictedaccess" />
        </StyledTag>
      </OverlayTrigger>
    );
  }
}

export default createFragmentContainer(RenderPrivateAccess, {
  project: graphql`
    fragment RenderPrivateAccess_project on Project {
      visibility
      archived
    }
  `,
});
