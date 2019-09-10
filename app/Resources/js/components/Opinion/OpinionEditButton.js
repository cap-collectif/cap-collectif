// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import OpinionEditModal from './Edit/OpinionEditModal';
import { openOpinionEditModal } from '../../redux/modules/opinion';
import type { OpinionEditButton_opinion } from '~relay/OpinionEditButton_opinion.graphql';

type Props = {
  dispatch: Function,
  opinion: OpinionEditButton_opinion,
};

export class OpinionEditButton extends React.Component<Props> {
  render() {
    const { opinion, dispatch } = this.props;
    return (
      <>
        <Button
          id="opinion-edit-btn"
          className="opinion__action--edit pull-right btn--outline btn-dark-gray"
          onClick={() => {
            dispatch(openOpinionEditModal(opinion.id));
          }}>
          <i className="cap cap-pencil-1" /> {<FormattedMessage id="global.edit" />}
        </Button>{' '}
        <OpinionEditModal opinion={opinion} />
      </>
    );
  }
}

const container = connect()(OpinionEditButton);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionEditButton_opinion on Opinion {
      ...OpinionEditModal_opinion
      id
    }
  `,
});
