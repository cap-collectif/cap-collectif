// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import DatesInterval from '../Utils/DatesInterval';

type Props = {
  step: Object,
  className?: string,
  votes?: number,
};

class StepPreview extends React.Component<Props> {
  static defaultProps = {
    className: '',
    votes: null,
  };

  render() {
    const { className, votes } = this.props;
    const { step } = this.props;
    return (
      <li className={className}>
        <div>
          <div className="navbar__step-nb">{step.position}</div>
          <div className="navbar__step">
            <h3 className="navbar__step-title">{step.title}</h3>
            <p className="excerpt small">
              <DatesInterval startAt={step.startAt} endAt={step.endAt} />
            </p>
            {step.status ? (
              <p className="label label-default">
                <FormattedMessage id={`step.status.${step.status}`} />
              </p>
            ) : null}
            {votes === null ? null : (
              <p style={{ marginTop: '5px' }}>
                <span className="nb--highlighted">{votes}</span>
                <span className="excerpt">
                  {' '}
                  <FormattedMessage id="vote.count_no_nb" values={{ count: votes }} />
                </span>
              </p>
            )}
          </div>
        </div>
      </li>
    );
  }
}

export default StepPreview;
