// @flow
import React from 'react';
import { Well } from 'react-bootstrap';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';
import FormattedText from '../../services/FormattedText';

const OpinionBody = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  isVersion() {
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  render() {
    const { opinion } = this.props;

    if (this.isVersion()) {
      return (
        <div>
          {opinion.comment !== null && FormattedText.strip(opinion.comment).length
            ? <div>
                <p className="control-label h5">
                  {this.getIntlMessage('opinion.version_comment')}
                </p>
                <Well bsSize="small">
                  <div>
                    <FormattedHTMLMessage message={opinion.comment} />
                  </div>
                </Well>
              </div>
            : null
          }
          <div className="diff">
            <FormattedHTMLMessage message={opinion.diff} />
          </div>
        </div>
      );
    }

    return <OpinionBodyDiffContent opinion={opinion} />;
  },

});

export default OpinionBody;
