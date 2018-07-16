// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { ButtonToolbar } from 'react-bootstrap';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import OpinionVersionEditButton from './OpinionVersionEditButton';
import OpinionVersionEditModal from './OpinionVersionEditModal';
import OpinionReportButton from './OpinionReportButton';
import OpinionDelete from './Delete/OpinionDelete';
import OpinionEditButton from './OpinionEditButton';
import type { State } from '../../types';
import type { OpinionButtons_opinion } from './__generated__/OpinionButtons_opinion.graphql';

type Props = {
  opinion: OpinionButtons_opinion,
  user?: Object,
};

class OpinionButtons extends React.Component<Props> {
  static defaultProps = {
    user: null,
  };

  isVersion = () => {
    const { opinion } = this.props;
    return !!opinion.parent;
  };

  isTheUserTheAuthor = () => {
    const { opinion, user } = this.props;
    if (opinion.author === null || !user) {
      return false;
    }
    return user.uniqueId === opinion.author.slug;
  };

  renderEditButton = () => {
    const { opinion } = this.props;
    if (opinion.contribuable && this.isTheUserTheAuthor()) {
      if (this.isVersion()) {
        return (
          <OpinionVersionEditButton
            className="pull-right"
            style={{ marginLeft: '5px' }}
            opinionId={opinion.parent.id}
            version={opinion}
          />
        );
      }
      return (
        <OpinionEditButton
          className="opinion__action--edit pull-right btn--outline btn-dark-gray"
          opinion={opinion}
        />
      );
    }
  };

  render() {
    const opinion = this.props.opinion;
    return (
      <ButtonToolbar>
        <OpinionDelete opinion={opinion} />
        {this.renderEditButton()}
        <OpinionReportButton opinion={opinion} />
        <ShareButtonDropdown
          id="opinion-share-button"
          className="pull-right"
          title={opinion.title}
          url={opinion.section.url}
        />
        <OpinionVersionEditModal />
      </ButtonToolbar>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
  user: state.user.user,
});

const container = connect(mapStateToProps)(OpinionButtons);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionButtons_opinion on OpinionOrVersion {
      ... on Opinion {
        contribuable
        title
        section {
          url
        }
        author {
          slug
        }
      }
    }
  `,
});