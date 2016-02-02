import React from 'react';
import {Well} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';
import Validator from '../../services/Validator';

const OpinionBody = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  isVersion() {
    return !!this.props.opinion.parent;
  },

  render() {
    const {opinion} = this.props;

    if (this.isVersion()) {
      return (
        <div>
          {opinion.comment !== null && (new Validator(opinion.comment)).notBlankHtml()
            ? <div>
                <p className="control-label h5">
                  {this.getIntlMessage('opinion.version_comment')}
                </p>
                <Well bsSize="small">
                  <div dangerouslySetInnerHTML={{__html: opinion.comment}} />
                </Well>
              </div>
            : null
          }
          <div dangerouslySetInnerHTML={{__html: opinion.diff}} />
        </div>
      );
    }

    return <OpinionBodyDiffContent opinion={opinion} />;
  },

});

export default OpinionBody;
