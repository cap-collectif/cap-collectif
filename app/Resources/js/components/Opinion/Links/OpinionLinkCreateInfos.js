// @flow
import React from 'react';
import { IntlMixin } from 'react-intl';

const OpinionLinkCreateInfos = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { opinion } = this.props;
    return (
      <div>
        <div className="modal-top bg-info">
          <p>
            {this.getIntlMessage('opinion.link.infos')}
          </p>
        </div>
        <p>
          {this.getIntlMessage('opinion.link.info')}
          {' '}
          <a href={opinion._links.show}>
            {opinion.title}
          </a>
        </p>
      </div>
    );
  },
});

export default OpinionLinkCreateInfos;
