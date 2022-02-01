// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { Tag, Tooltip, CapUIIcon, Icon } from '@cap-collectif/ui'
import type { RenderPrivateAccess_project$key } from '~relay/RenderPrivateAccess_project.graphql';

type Props = {
  project: RenderPrivateAccess_project$key,
  isOnProjectCard?: boolean,
};

const FRAGMENT = graphql`
  fragment RenderPrivateAccess_project on Project {
    visibility
    archived
  }
`;

const RenderPrivateAccess = ({ project, isOnProjectCard = false }: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  let visibleBy = 'global.draft.only_visible_by_you';
  if (data && data.visibility && data.visibility === 'ADMIN') {
    visibleBy = 'only-visible-by-administrators';
  }

  return (
    <Tooltip placement="top" label={<FormattedMessage id={visibleBy} />}>
      <Tag
        id="restricted-access"
        variantColor={data.archived ? 'gray' : 'neutral-gray'}
        mr={isOnProjectCard ? 4 : 0}
      >
        <Icon name={CapUIIcon.Lock}/>
        <FormattedMessage id="restrictedaccess" />
      </Tag>
    </Tooltip>
  );
};
export default RenderPrivateAccess;
