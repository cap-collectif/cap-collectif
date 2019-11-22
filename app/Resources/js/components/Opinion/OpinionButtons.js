// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { ButtonToolbar } from 'react-bootstrap';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import OpinionVersionEditButton from '../OpinionVersion/OpinionVersionEditButton';
import OpinionVersionEditModal from '../OpinionVersion/OpinionVersionEditModal';
import OpinionReportButton from './OpinionReportButton';
import OpinionDelete from './Delete/OpinionDelete';
import OpinionEditButton from './OpinionEditButton';
import type { State } from '../../types';
import type { OpinionButtons_opinion } from '~relay/OpinionButtons_opinion.graphql';
import OpinionFollowButton from './Follow/OpinionFollowButton';

type Props = {
  opinion: OpinionButtons_opinion,
  user?: Object,
};

export class OpinionButtons extends React.Component<Props> {
  static defaultProps = {
    user: null,
  };

  isTheUserTheAuthor = () => {
    const { opinion, user } = this.props;
    if (!opinion.author || !user) {
      return false;
    }
    return user.uniqueId === opinion.author.slug;
  };

  renderEditButton = () => {
    const { opinion } = this.props;
    if (opinion.contribuable && this.isTheUserTheAuthor()) {
      if (opinion.__typename === 'Version') {
        return (
          <React.Fragment>
            <OpinionVersionEditModal version={opinion} />
            <OpinionVersionEditButton />
          </React.Fragment>
        );
      }
      return (
        <OpinionEditButton
          className="opinion__action--edit btn--outline btn-dark-gray"
          opinion={opinion}
        />
      );
    }
  };

  render() {
    const { opinion } = this.props;
    if (!opinion) {
      return null;
    }
    return (
      <ButtonToolbar>
        <OpinionDelete opinion={opinion} />
        <div>
          {this.renderEditButton()}
          {opinion.project && opinion.project.opinionCanBeFollowed && (
            <OpinionFollowButton opinion={opinion} />
          )}
        </div>
        <div>
          <OpinionReportButton opinion={opinion} />
          {opinion.title && opinion.url && (
            <ShareButtonDropdown
              id="opinion-share-button"
              className="ml-5"
              title={opinion.title}
              url={opinion.url}
            />
          )}
        </div>
      </ButtonToolbar>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  user: state.user.user,
});

const container = connect(mapStateToProps)(OpinionButtons);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionButtons_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionDelete_opinion
      ...OpinionReportButton_opinion @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionFollowButton_opinion @arguments(isAuthenticated: $isAuthenticated)
      ... on Opinion {
        ...OpinionEditButton_opinion
        __typename
        contribuable
        title
        url
        section {
          url
        }
        project {
          opinionCanBeFollowed
        }
        author {
          slug
        }
      }
      ... on Version {
        __typename
        ...OpinionVersionEditModal_version
        contribuable
        url
        title
        section {
          url
        }
        author {
          slug
        }
        project {
          opinionCanBeFollowed
        }
      }
    }
  `,
});
