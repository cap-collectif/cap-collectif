// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { useDisclosure } from '@liinkiing/react-hooks';
import UserGroupModalLegacy from './UserGroupModalLegacy';
import Tag from '~ds/Tag/Tag';
import Tooltip from '~ds/Tooltip/Tooltip';
import type { RenderCustomAccessLegacy_project$key } from '~relay/RenderCustomAccessLegacy_project.graphql';
import { ICON_NAME } from '~ds/Icon/Icon';

type Props = {| +project: RenderCustomAccessLegacy_project$key, +isOnProjectCard?: boolean |};
const FRAGMENT = graphql`
    fragment RenderCustomAccessLegacy_project on Project
    @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        restrictedViewers(first: $count, after: $cursor) {
            totalUserCount
        }
        archived
        ...UserGroupModalLegacy_project @arguments(count: $count, cursor: $cursor)
    }
`;

const RenderCustomAccessLegacy = ({ project, isOnProjectCard = false }: Props): React.Node => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const data = useFragment(FRAGMENT, project);

  let nbUserInGroups = 0;
  if (
    data != null &&
    data.restrictedViewers != null &&
    data.restrictedViewers.totalUserCount != null
  ) {
    nbUserInGroups = data.restrictedViewers.totalUserCount;
  }

  return (
    <React.Fragment>
      <Tooltip
        id="tooltip"
        label={intl.formatMessage({ id: 'only-visible-by' }, { num: nbUserInGroups })}>
        <Tag
          id="restricted-access"
          icon={ICON_NAME.LOCK}
          variant="neutral-gray"
          color={data?.archived ? 'neutral-gray.500' : 'neutral-gray.800'}
          onClick={onOpen}
          mr={isOnProjectCard ? 4 : 0}>
          <FormattedMessage id="restrictedaccess" />
        </Tag>
      </Tooltip>

      <UserGroupModalLegacy project={data} show={isOpen} handleClose={onClose} />
    </React.Fragment>
  );
};
export default RenderCustomAccessLegacy;
