// @flow
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
import LeafletControl from './LeafletControl';
import { LoaderPane } from './ProposalLeafletMap.style';

type Props = {|
  hasError: boolean,
  retry: () => void,
|};

const ProposalMapLoaderPane = ({ hasError, retry }: Props) => {
  const [isOffline, setIsOffline] = useState<boolean>(!window.navigator.onLine);

  useEffect(() => {
    window.addEventListener('offline', () => setIsOffline(true));
    window.addEventListener('online', () => setIsOffline(false));

    return () => {
      window.removeEventListener('offline', () => setIsOffline(true));
      window.removeEventListener('online', () => setIsOffline(false));
    };
  });

  return (
    <LeafletControl position="bottomleft">
      <LoaderPane>
        {isOffline ? (
          <div>
            <Icon name={ICON_NAME.wifiOff} size={14} color="#ff8b00" />
            <FormattedMessage id="attempt.to.connect" />
          </div>
        ) : hasError ? (
          <div>
            <Icon name={ICON_NAME.removeCircle} size={14} color="#f00040" />
            <FormattedMessage id="loading.failed.retry" />
            <button onClick={retry} type="button">
              <FormattedMessage id="global.retry" />
            </button>
          </div>
        ) : (
          <div>
            <Loader size={14} />
            <FormattedMessage id="loading.proposals" />
          </div>
        )}
      </LoaderPane>
    </LeafletControl>
  );
};
export default ProposalMapLoaderPane;
