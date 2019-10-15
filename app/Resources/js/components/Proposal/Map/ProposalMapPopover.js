// @flow
import * as React from 'react';
import styled from 'styled-components';
import type { ProposalMapMarker } from './LeafletMap';
import { UserAvatar } from '../../User/UserAvatar';

type Props = {|
  mark: ProposalMapMarker,
|};

const PopoverContainer = styled.div`
  margin: 20px 15px;
`;

const AuthorContainer = styled.div`
  margin-bottom: 10px;
  padding-bottom: 19px;
  border-bottom: 1px solid #ddd;
  a {
    font-size: 16px;
  }
  div {
    font-size: 14px;
  }
`;

const TitleContainer = styled.div`
  font-size: 16px;
`;

const PopoverCover = styled.img`
  height: 83px;
  border-radius: 4px 4px 0px 0px;
  width: 262px;
  margin: -1px;
  object-fit: cover;
`;

export const ProposalMapPopover = ({ mark }: Props) => (
  <>
    {mark.media && <PopoverCover src={mark.media} alt="proposal-illustration" />}
    <PopoverContainer>
      <AuthorContainer>
        <UserAvatar className="pull-left" user={mark.author} />
        <a href={mark.author.url}>{mark.author.username}</a>
        <div>{mark.date}</div>
      </AuthorContainer>
      <TitleContainer>
        <a href={mark.url}>{mark.title}</a>
      </TitleContainer>
    </PopoverContainer>
  </>
);
