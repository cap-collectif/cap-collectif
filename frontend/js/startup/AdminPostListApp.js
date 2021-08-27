// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminPostList = lazy(() =>
  import(/* webpackChunkName: "AdminPostList" */ '~/components/Admin/Post/PostList/PostListQuery'),
);

type Props = {|
  +isAdmin: boolean,
|};

export default ({ isAdmin }: Props) => (
  <Providers>
    <Suspense fallback={<Loader />}>
      <AdminPostList isAdmin={isAdmin} />
    </Suspense>
  </Providers>
);
