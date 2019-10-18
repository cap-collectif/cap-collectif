// @flow
import * as React from 'react';
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import classNames from 'classnames';
import { type ProjectStepFormAdminItemStep_step } from '~relay/ProjectStepFormAdminItemStep_step.graphql';

type Props = {
  index: number,
  step: ProjectStepFormAdminItemStep_step,
  handleClickEdit?: (index: number, type: any) => void,
  handleClickDelete?: (index: number, type: any) => void,
};

const ItemQuestionWrapper = styled.div`
  padding-right: 8px;
`;

export class ProjectStepFormAdminItemStep extends React.Component<Props> {
  render() {
    const { step, index } = this.props;

    const iconClassType = classNames(
      'cap',
      { 'cap-bubble-ask-2': step.type !== 'section' },
      { 'cap-small-caps-1': step.type === 'section' },
    );

    return (
      <Row>
        <Col xs={8} className="d-flex align-items-center">
          <ItemQuestionWrapper>
            <i className="cap cap-android-menu" style={{ color: '#0388cc', fontSize: '20px' }} />
          </ItemQuestionWrapper>
          <ItemQuestionWrapper>
            <i className={iconClassType} style={{ color: '#707070', fontSize: '20px' }} />
          </ItemQuestionWrapper>
          <ItemQuestionWrapper>
            <strong>{step.title}</strong>
            <br />
            <span className="excerpt">{step.type && <FormattedMessage id={step.type} />}</span>
          </ItemQuestionWrapper>
        </Col>
        <Col xs={4}>
          <ButtonToolbar className="pull-right">
            <Button
              id={`js-btn-edit-${index}`}
              bsStyle="warning"
              className="btn-edit btn-outline-warning"
              onClick={() => {}}>
              <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
            </Button>
            <Button
              id={`js-btn-delete-${index}`}
              bsStyle="danger"
              className="btn-outline-danger"
              onClick={() => {}}>
              <i className="cap cap-times" /> <FormattedMessage id="global.delete" />
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }
}

export default createFragmentContainer(ProjectStepFormAdminItemStep, {
  step: graphql`
    fragment ProjectStepFormAdminItemStep_step on Step {
      id
      title
      type
    }
  `,
});
