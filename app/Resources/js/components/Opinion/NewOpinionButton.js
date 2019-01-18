// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../Utils/LoginOverlay';
import OpinionCreateModal from './Create/OpinionCreateModal';
import { openOpinionCreateModal } from '../../redux/modules/opinion';
import type { NewOpinionButton_section } from './__generated__/NewOpinionButton_section.graphql';
import type { NewOpinionButton_consultation } from './__generated__/NewOpinionButton_consultation.graphql';

type Props = {
  section: NewOpinionButton_section,
  consultation: NewOpinionButton_consultation,
  label: string,
  dispatch: Function,
};

class NewOpinionButton extends React.Component<Props> {
  render() {
    const { dispatch, label, consultation, section } = this.props;
    const disabled = !consultation.contribuable;
    return (
      <React.Fragment>
        <LoginOverlay>
          <Button
            bsStyle="primary"
            disabled={disabled}
            id={`btn-add--${section.slug}`}
            onClick={() => {
              dispatch(openOpinionCreateModal(section.id));
            }}>
            <i className="cap cap-add-1" />
            <span className="hidden-xs">{label}</span>
          </Button>
        </LoginOverlay>
        <OpinionCreateModal section={section} consultation={consultation} />
      </React.Fragment>
    );
  }
}

const container = connect()(NewOpinionButton);

export default createFragmentContainer(container, {
  section: graphql`
    fragment NewOpinionButton_section on Section {
      id
      slug
      ...OpinionCreateModal_section
    }
  `,
  consultation: graphql`
    fragment NewOpinionButton_consultation on Consultation
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      ...OpinionCreateModal_consultation @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
