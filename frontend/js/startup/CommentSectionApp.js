// @flow
import React from 'react';
import Providers from './Providers';
import CommentSection from '../components/Comment/CommentSection';

type Props = { commentableId: string };

export default ({ commentableId }: Props) => (
  <Providers>
      <CommentSection commentableId={commentableId} />
    </Providers>
);
