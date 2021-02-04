// @flow
import React, { lazy, Suspense } from 'react';

import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';
import {
  type Props
} from '../components/Project/Counter/ProjectHeaderCounter';


const ProjectHeaderCounter = lazy(() =>
  import(/* webpackChunkName: "ProjectHeaderCounter" */ '~/components/Project/Counter/ProjectHeaderCounter'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectHeaderCounter {...props} />
    </Providers>
  </Suspense>
);

