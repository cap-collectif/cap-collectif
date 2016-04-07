import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

import DatesInterval from './../Utils/DatesInterval';

const StepPreview = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    votes: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      votes: null,
    };
  },

  render() {
    const step = this.props.step;
    return (
      <li className={this.props.className}>
        <div>
          <div className="navbar__step-nb">{step.position}</div>
          <div className="navbar__step">
            <h3 className="navbar__step-title">
              {step.title}
            </h3>
            <p className="excerpt small">
              <DatesInterval startAt={step.startAt} endAt={step.endAt} />
            </p>
            {
              step.status
              ? <p className="label label-default">
                {this.getIntlMessage('step.status.' + step.status)}
              </p>
              : null
            }
            {
              this.props.votes === null
              ? null
              : <p style={{ marginTop: '5px' }}>
                  <span className="nb--highlighted">
                    {this.props.votes}
                  </span>
                  <span className="excerpt">
                    {' '}
                    <FormattedMessage
                      message={this.getIntlMessage('vote.count_no_nb')}
                      count={this.props.votes}
                    />
                  </span>
              </p>
            }
          </div>
        </div>
      </li>
    );
  },

});

export default StepPreview;
