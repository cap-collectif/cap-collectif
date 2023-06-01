// @flow
import { Flex } from '@cap-collectif/ui';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import ProjectStepHeader, { BACKGROUND_COLOR } from './ProjectStepHeader';
import useIsMobile from '~/utils/hooks/useIsMobile';
import VoteStepPageWebLayout from './VoteStepPageWebLayout';
import VoteStepPageMobileLayout from './VoteStepPageMobileLayout';
import { VoteStepContextProvider } from '~/components/VoteStep/Context/VoteStepContext';
import { useWindowWidth } from '~/utils/hooks/useWindowWidth';
import TabletScreenTooSmall from './TabletScreenTooSmall';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {|
  +stepId: string,
  +projectId: string,
  +isMapView: boolean,
|};

export const VoteStepPage = ({ stepId, isMapView }: Props) => {
  const new_vote_step = useFeatureFlag('new_vote_step');

  const isMobile = useIsMobile();
  const { width } = useWindowWidth();

  const { state } = useLocation();

  const isTabletScreenTooSmall = width > 767 && width < 1024;

  const step = state?.stepId || stepId;

  React.useEffect(() => {
    const html = document.querySelector('html');
    if (html) html.classList.remove('has-vote-widget');
  }, []);

  if (!new_vote_step) return null; // Just to be sure

  return (
    <>
      {isTabletScreenTooSmall ? <TabletScreenTooSmall /> : null}
      <VoteStepContextProvider isMapView={isMapView}>
        <Flex direction="column" position="relative">
          <React.Suspense fallback={<Flex bg={BACKGROUND_COLOR} width="100%" p={8} />}>
            <ProjectStepHeader stepId={step} />
          </React.Suspense>
          {isMobile ? (
            <VoteStepPageMobileLayout stepId={step} isMapView={isMapView} />
          ) : (
            <VoteStepPageWebLayout stepId={step} isMapView={isMapView} />
          )}
        </Flex>
      </VoteStepContextProvider>
    </>
  );
};

export default VoteStepPage;
