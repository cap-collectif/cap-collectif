// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

type Props = {
  children: any,
};

export class DraftBox extends React.Component<Props> {
  render() {
    const boxClasses = classNames({ draft__box: true });

    return (
      <div>
        <p id="draft">
          <h3>
            <FormattedMessage id="global.draft.your_draft" />
            <span className="subtitle">
              <i className="cap cap-lock-2-1" />
              <FormattedMessage id="global.draft.only_visible_by_you" />
            </span>
          </h3>
        </p>
        <div className={boxClasses}>{this.props.children}</div>
      </div>
    );
  }
}

export default DraftBox;
