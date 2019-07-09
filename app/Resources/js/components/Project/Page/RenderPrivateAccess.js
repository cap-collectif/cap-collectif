// @flow
import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import Tag from '../../Ui/Labels/Tag';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { RenderPrivateAccess_project } from '~relay/RenderPrivateAccess_project.graphql';

type Props = {
  project: RenderPrivateAccess_project,
  lockIcon?: ?string,
};

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
        <Tag icon={`cap ${lock} mr-1`}>
          <FormattedMessage id="restrictedaccess" />
        </Tag>
      </OverlayTrigger>
    );
  }
}

export default createFragmentContainer(RenderPrivateAccess, {
  project: graphql`
    fragment RenderPrivateAccess_project on Project {
      visibility
    }
  `,
});
