// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import OpinionLink from './OpinionLink';

const OpinionLinkList = React.createClass({
  propTypes: {
    links: React.PropTypes.array.isRequired,
  },

  render() {
    const { links } = this.props;
    if (links.length === 0) {
      return (
        <p className="text-center">
          <i className="cap-32 cap-baloon-1" />
          <br />
          {<FormattedMessage id="opinion.no_new_link" />}
        </p>
      );
    }

    return (
      <ul id="links-list" className="media-list" style={{ marginTop: '20px' }}>
        {links.map(link => {
          return <OpinionLink {...this.props} key={link.id} link={link} />;
        })}
      </ul>
    );
  },
});

export default OpinionLinkList;
