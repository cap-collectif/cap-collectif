// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import ArgumentVoteBox from './Vote/ArgumentVoteBox';
import ArgumentEditModal from './Edition/ArgumentEditModal';
import ArgumentDeleteModal from './Deletion/ArgumentDeleteModal';
import ArgumentReportButton from './ArgumentReportButton';
import EditButton from '../Form/EditButton';
import DeleteButton from '../Form/DeleteButton';
import { openArgumentEditModal } from '../../redux/modules/opinion';
import type { ArgumentButtons_argument } from '~relay/ArgumentButtons_argument.graphql';
import type { Dispatch } from '../../types';

type OwnProps = {|
  argument: ArgumentButtons_argument,
|};

type Props = {|
  ...OwnProps,
  dispatch: Dispatch,
|};

type State = {|
  isDeleting: boolean,
|};

class ArgumentButtons extends React.Component<Props, State> {
  state = {
    isDeleting: false,
  };

  openDeleteModal = () => {
    this.setState({ isDeleting: true });
  };

  closeDeleteModal = () => {
    this.setState({ isDeleting: false });
  };

  render() {
    const { argument, dispatch } = this.props;
    return (
      <div className="small">
        {/* $FlowFixMe */}
        <ArgumentVoteBox argument={argument} />
        {/* $FlowFixMe */}
        <ArgumentReportButton argument={argument} />
        <EditButton
          onClick={() => {
            dispatch(openArgumentEditModal(argument.id));
          }}
          author={{ uniqueId: argument.author.slug }}
          editable={argument.contribuable}
          className="argument__btn--edit btn-xs btn-dark-gray btn--outline"
        />
        <ArgumentEditModal argument={argument} />{' '}
        <DeleteButton
          onClick={this.openDeleteModal}
          author={{ uniqueId: argument.author.slug }}
          className="argument__btn--delete btn-xs"
        />
        {/* $FlowFixMe */}
        <ArgumentDeleteModal
          argument={argument}
          show={this.state.isDeleting}
          onClose={this.closeDeleteModal}
        />{' '}
        <ShareButtonDropdown
          id={`arg-${argument.id}-share-button`}
          url={argument.url}
          bsSize="xs"
          outline
          grey
        />
      </div>
    );
  }
}

const container = connect()(ArgumentButtons);
export default createFragmentContainer(container, {
  argument: graphql`
    fragment ArgumentButtons_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      author {
        id
        slug
        displayName
      }
      id
      contribuable
      url
      ...ArgumentDeleteModal_argument
      ...ArgumentEditModal_argument
      ...ArgumentVoteBox_argument @arguments(isAuthenticated: $isAuthenticated)
      ...ArgumentReportButton_argument @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
