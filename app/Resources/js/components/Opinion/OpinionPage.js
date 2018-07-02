// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedHTMLMessage } from 'react-intl';
import { Alert, Glyphicon } from 'react-bootstrap';
import OpinionStore from '../../stores/OpinionStore';
import OpinionActions from '../../actions/OpinionActions';
import FlashMessages from '../Utils/FlashMessages';
import { fetchOpinionVotes } from '../../redux/modules/opinion';
import type { Dispatch } from '../../types';

import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import Loader from '../Ui/Loader';

type Props = {
  opinionId: string,
  versionId: ?string,
  fetchOpinionVotes: Function,
};
type State = {
  opinion: ?Object,
  isLoading: boolean,
  rankingThreshold: ?number,
  opinionTerm: number,
  messages: {
    errors: Array<string>,
    success: Array<string>,
  },
};

export class OpinionPage extends React.Component<Props, State> {
  state = {
    opinion: null,
    isLoading: true,
    rankingThreshold: null,
    opinionTerm: 0,
    messages: {
      errors: [],
      success: [],
    },
  };

  componentWillMount = () => {
    OpinionStore.addChangeListener(this.onChange);
  };

  componentDidMount = () => {
    this.loadOpinion();
  };

  componentWillUnmount = () => {
    OpinionStore.removeChangeListener(this.onChange);
  };

  onChange = () => {
    if (!OpinionStore.isProcessing && OpinionStore.isOpinionSync) {
      this.setState({
        opinion: OpinionStore.opinion,
        rankingThreshold: OpinionStore.rankingThreshold,
        opinionTerm: OpinionStore.opinionTerm,
        isLoading: false,
        messages: OpinionStore.messages,
      });
      return;
    }

    this.loadOpinion();
  };

  loadOpinion = () => {
    const { opinionId, versionId } = this.props;
    OpinionActions.loadOpinion(opinionId, versionId);
    this.props.fetchOpinionVotes(opinionId, versionId);
  };

  render() {
    return (
      <div className="has-chart">
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} />
        <Loader show={this.state.isLoading}>
          {this.state.opinion && (
            <div>
              {this.state.opinion.isTrashed && (
                <Alert bsStyle="danger">
                  <Glyphicon glyph="trash" />{' '}
                  <FormattedHTMLMessage
                    id="in-the-trash"
                    values={{ reason: this.state.opinion.trashedReason || '' }}
                  />
                </Alert>
              )}
              <OpinionBox
                {...this.props}
                rankingThreshold={this.state.rankingThreshold}
                opinionTerm={this.state.opinionTerm}
                opinion={this.state.opinion}
              />
            </div>
          )}
          {this.state.opinion && <OpinionTabs {...this.props} opinion={this.state.opinion} />}
        </Loader>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchOpinionVotes: opinionId => dispatch(fetchOpinionVotes(opinionId)),
  };
};

export default connect(null, mapDispatchToProps)(OpinionPage);
