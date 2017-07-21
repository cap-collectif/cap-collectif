import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import ReplyStore from '../../stores/ReplyStore';
import ReplyActions from '../../actions/ReplyActions';
import UserReplies from '../Reply/UserReplies';


const QuestionnaireStepPage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    userReplies: PropTypes.array.isRequired,
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
    const { userReplies } = this.props;
    ReplyActions.initUserReplies(userReplies);
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
    const {
      form,
      step,
    } = this.props;
    return (
      <div>
        <StepPageHeader step={step} />
        <UserReplies
          replies={this.state.userReplies}
          form={form}
        />
        <ReplyCreateFormWrapper
          form={form}
          userReplies={this.state.userReplies}
        />
        <StepPageFooter step={step} />
      </div>
    );
  },

});

export default QuestionnaireStepPage;
