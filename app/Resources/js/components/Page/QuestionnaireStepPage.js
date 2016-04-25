import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

import StepPageHeader from '../Steps/Page/StepPageHeader';
import ReplyCreateForm from '../Reply/Form/ReplyCreateForm';
import ReplyStore from '../../stores/ReplyStore';
import ReplyActions from '../../actions/ReplyActions';
import UserReplies from '..//Reply/UserReplies';

const QuestionnaireStepPage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    userReplies: PropTypes.array,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      userReplies: [],
    };
  },

  componentWillMount() {
    ReplyStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    ReplyActions.initUserReplies(this.props.userReplies);
  },

  componentWillUnmount() {
    ReplyStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      userReplies: ReplyStore.userReplies,
    });
  },

  render() {
    return (
      <div>
        <StepPageHeader step={this.props.step} />
        <UserReplies
          replies={this.state.userReplies}
          form={this.props.form}
        />
        <div>
          <ReplyCreateForm
            form={this.props.form}
            userReplies={this.state.userReplies}
          />
        </div>
      </div>
    );
  },

});

export default QuestionnaireStepPage;
