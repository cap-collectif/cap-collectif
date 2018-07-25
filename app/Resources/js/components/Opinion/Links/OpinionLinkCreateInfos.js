// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  opinion: Object,
};

class OpinionLinkCreateInfos extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    return (
      <div>
        <div className="modal-top bg-info">
          <p>{<FormattedMessage id="opinion.link.infos" />}</p>
        </div>
        <p>
          {<FormattedMessage id="opinion.link.info" />}{' '}
          <a href={opinion._links.show}>{opinion.title}</a>
        </p>
      </div>
    );
  }
}

export default OpinionLinkCreateInfos;
