// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import DatesInterval from './../Utils/DatesInterval';
import ViewBox from './ViewBox';
import EditBox from './EditBox';
import FlashMessages from '../Utils/FlashMessages';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisStore from '../../stores/SynthesisStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import SynthesisActions from '../../actions/SynthesisActions';
import { type GlobalState } from '../../types';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  step: Object,
  user: Object,
  mode: string,
  synthesis_id: string,
  children: ?Object,
  sideMenu: ?boolean,
};

type State = {
  synthesis: ?Object,
  messages: {
    errors: Array<*>,
    success: Array<*>,
  },
};

export class SynthesisBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.props = {
      step: {},
      user: {},
      mode: '',
      synthesis_id: '',
      children: null,
      sideMenu: false,
    };

    this.state = {
      synthesis: null,
      messages: {
        errors: [],
        success: [],
      },
    };
  }

  componentWillMount = () => {
    SynthesisElementStore.addChangeListener(this.onElementsChange);
    SynthesisStore.addChangeListener(this.onSynthesisChange);
  };

  componentDidMount = () => {
    const { synthesis_id } = this.props;
    SynthesisActions.load(synthesis_id);
  };

  componentWillUnmount = () => {
    SynthesisElementStore.removeChangeListener(this.onElementsChange);
    SynthesisStore.removeChangeListener(this.onSynthesisChange);
  };

  onElementsChange = () => {
    this.setState({
      messages: SynthesisElementStore.messages,
    });
  };

  onSynthesisChange = () => {
    this.setState({
      synthesis: SynthesisStore.synthesis,
    });
  };

  dismissMessage = (message: any, type: any) => {
    SynthesisElementActions.dismissMessage(message, type);
  };

  renderBoxMode = () => {
    const { children, mode, sideMenu } = this.props;
    if (this.state.synthesis !== null) {
      if (mode === 'view') {
        return <ViewBox synthesis={this.state.synthesis} />;
      }
      if (mode === 'edit') {
        return (
          <EditBox synthesis={this.state.synthesis} sideMenu={sideMenu}>
            {children}
          </EditBox>
        );
      }
      return <p>{<FormattedMessage id="synthesis.common.errors.incorrect_mode" />}</p>;
    }
  };

  renderViewMode = () => {
    const { step, user, mode } = this.props;
    const { synthesis } = this.state;

    if (mode === 'view') {
      return (
        <div>
          <h2>
            {step.title}
            {synthesis &&
              synthesis.editable &&
              user &&
              user.isAdmin && (
                <a
                  className="btn btn-primary pull-right"
                  href={step._links.editSynthesis}
                  title="{{ 'synthesis.edit.button' | trans({}, 'CapcoAppBundle') }}">
                  <i className="cap cap-pencil-1" />
                  <FormattedMessage id="synthesis.edit.button" />
                </a>
              )}
          </h2>

          {(step.startAt || step.endAt) && (
            <div className="mb-30">
              <i className="cap cap-calendar-2-1" />{' '}
              <DatesInterval startAt={step.startAt} endAt={step.endAt} fullDay />
            </div>
          )}
          {step.body && <WYSIWYGRender className="block" value={step.body} />}
        </div>
      );
    }
  };

  render() {
    return (
      <div className="synthesis__box">
        {this.renderViewMode()}
        <FlashMessages
          errors={this.state.messages.errors}
          success={this.state.messages.success}
          onDismissMessage={this.dismissMessage}
        />
        {this.renderBoxMode()}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  step:
    state.project.currentProjectById &&
    state.project.projectsById[state.project.currentProjectById].stepsById[
      state.project.currentProjectStepById
    ],
  user: state.user.user,
});

export default connect(mapStateToProps)(SynthesisBox);
