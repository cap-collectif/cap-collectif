// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const CommentSection = lazy(
  () => import(/* webpackChunkName: "CommentSection" */ '~/components/Comment/CommentSection'),
);

type Props = { commentableId: string };

export default ({ commentableId }: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem resetCSS={false}>
        <CommentSection commentableId={commentableId} />
      </Providers>
    </Suspense>
  );
};
