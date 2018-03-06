// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import OpinionAppendix from './OpinionAppendix';

const OpinionAppendices = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired
  },

  isVersion() {
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  hasAppendices() {
    const { opinion } = this.props;
    const appendices = this.isVersion() ? opinion.parent.appendices : opinion.appendices;
    if (!appendices) {
      return false;
    }
    return appendices.some((app: Object) => {
      return !!app.body;
    });
  },

  render() {
    if (!this.hasAppendices()) {
      return null;
    }
    const opinion = this.props.opinion;
    const appendices = this.isVersion() ? opinion.parent.appendices : opinion.appendices;

    return (
      <div className="opinion__description">
        {this.isVersion() ? (
          <p>
            {<FormattedMessage id="opinion.version_parent" />}
            <a href={opinion.parent._links.show}>{opinion.parent.title}</a>
          </p>
        ) : null}
        {appendices.map((appendix, index) => {
          if (appendix.body) {
            return <OpinionAppendix key={index} appendix={appendix} expanded={index === 0} />;
          }
        })}
      </div>
    );
  }
});

export default OpinionAppendices;
