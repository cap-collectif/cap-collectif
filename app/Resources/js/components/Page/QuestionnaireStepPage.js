// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import ReplyStore from '../../stores/ReplyStore';
import ReplyActions from '../../actions/ReplyActions';
import UserReplies from '../Reply/UserReplies';

type Props = {
  step: Object,
  form: Object,
  userReplies: Array<*>,
};

type State = {
  userReplies: Array<*>,
  project: {
    currentProjectById: string,
    projectsById: Object,
  },
};

export class QuestionnaireStepPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      userReplies: [],
      project: {
        currentProjectById: '',
        projectsById: {},
      },
    };
  }

  componentWillMount = () => {
    ReplyStore.addChangeListener(this.onChange);
  };

  componentDidMount = () => {
    const { userReplies } = this.props;
    ReplyActions.initUserReplies(userReplies);
  };

  componentWillUnmount = () => {
    ReplyStore.removeChangeListener(this.onChange);
  };

  onChange = () => {
    this.setState({
      userReplies: ReplyStore.userReplies,
    });
  };

  render() {
    const { form, step } = this.props;

    return (
      <div>
        <StepPageHeader step={step} />
        <UserReplies replies={this.state.userReplies} form={form} />
        <ReplyCreateFormWrapper form={form} userReplies={this.state.userReplies} />
        <StepPageFooter step={step} />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  step: state.project.projectsById[state.project.currentProjectById].stepsById[props.step.id],
});

export default connect(mapStateToProps)(QuestionnaireStepPage);
