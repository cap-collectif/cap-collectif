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
    const {
      className,
      votes,
    } = this.props;
    const step = this.props.step;
    return (
      <li className={className}>
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
                {this.getIntlMessage(`step.status.${step.status}`)}
              </p>
              : null
            }
            {
              votes === null
              ? null
              : <p style={{ marginTop: '5px' }}>
                  <span className="nb--highlighted">
                    {votes}
                  </span>
                  <span className="excerpt">
                    {' '}
                    <FormattedMessage
                      message={this.getIntlMessage('vote.count_no_nb')}
                      count={votes}
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
