// @flow
import React from 'react';
import { Well } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';
import FormattedText from '../../services/FormattedText';

const OpinionBody = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },

  isVersion() {
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  render() {
    const { opinion } = this.props;

    if (this.isVersion()) {
      return (
        <div>
          {opinion.comment !== null &&
          FormattedText.strip(opinion.comment).length
            ? <div>
                <p className="control-label h5">
                  <FormattedMessage id="opinion.version_comment" />
                </p>
                <Well bsSize="small">
                  <div dangerouslySetInnerHTML={{ __html: opinion.comment }} />
                </Well>
              </div>
            : null}
          <div
            className="diff"
            dangerouslySetInnerHTML={{ __html: opinion.diff }}
          />
        </div>
      );
    }

    return <OpinionBodyDiffContent opinion={opinion} />;
  },
});

export default OpinionBody;
