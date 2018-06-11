// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  action: string,
};

class OpinionSourceFormInfos extends React.Component<Props> {
  render() {
    const { action } = this.props;
    if (action === 'update') {
      return null;
    }

    return (
      <div className="modal-top bg-info">
        <p>{<FormattedMessage id="source.add_infos" />}</p>
      </div>
    );
  }
}

export default OpinionSourceFormInfos;
