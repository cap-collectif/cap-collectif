// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay';
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy';
import type { AnalystRevoked_analyst } from '~relay/AnalystRevoked_analyst.graphql';

type Props = {
  analyst: AnalystRevoked_analyst,
};

const AnalystRevokedContainer: StyledComponent<{}, {}, HTMLLIElement> = styled.li.attrs({
  className: 'analyst-revoked-container',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AnalystRevoked = ({ analyst }: Props) => (
  <AnalystRevokedContainer>
    <UserAvatarLegacy user={analyst} size={35} displayUrl={false} />
    <span className="mr-10">{analyst.username}</span>
  </AnalystRevokedContainer>
);

export default createFragmentContainer(AnalystRevoked, {
  analyst: graphql`
    fragment AnalystRevoked_analyst on User @relay(mask: false) {
      id
      username
      ...UserAvatar_user
    }
  `,
});
