// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

type Props = {
  children: any,
};

export const DraftBox = (props: Props) => {
  const boxClasses = classNames({ draft__box: true });

  const { children } = props;
  return (
    <div>
      <div id="draft">
        <h3>
          <FormattedMessage id="global.draft.your_draft" />
          <span className="subtitle">
            <i className="cap cap-lock-2-1" />
            <FormattedMessage id="global.draft.only_visible_by_you" />
          </span>
        </h3>
      </div>
      <div className={boxClasses}>{children}</div>
    </div>
  );
};

export default DraftBox;
