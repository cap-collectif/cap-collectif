// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const CommentSection = lazy(() =>
  import(/* webpackChunkName: "CommentSection" */ '~/components/Comment/CommentSection'),
);

type Props = { commentableId: string };

export default ({ commentableId }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <CommentSection commentableId={commentableId} />
    </Providers>
  </Suspense>
);
