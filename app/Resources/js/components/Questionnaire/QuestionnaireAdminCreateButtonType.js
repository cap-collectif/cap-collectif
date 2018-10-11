// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

type Props = {
  handleClick: string => void,
  type: string,
};

export default class QuestionnaireAdminCreateButtonType extends React.Component<Props> {
  render() {
    const { type } = this.props;
    return (
      <div
        id="step-view-toggle"
        className="btn-group d-flex mb-15"
        style={{ width: '100%' }}
        role="group"
        aria-label="Step view">
        <Button
          bsStyle="default"
          style={{ flex: '1 0 auto' }}
          active={type === 'QUESTIONNAIRE'}
          onClick={this.props.handleClick('QUESTIONNAIRE')}>
          <FormattedMessage id="Questionnaire" />
        </Button>
        <Button
          bsStyle="default"
          style={{ flex: '1 0 auto' }}
          active={type === 'SURVEY'}
          onClick={this.props.handleClick('SURVEY')}>
          <FormattedMessage id="Votation" />
        </Button>
      </div>
    );
  }
}
