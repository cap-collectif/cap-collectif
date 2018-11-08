// @flow
import React, { Component } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { Alert } from 'react-bootstrap';
import LoginSocialButtons from './LoginSocialButtons';
import LoginForm from './LoginForm';
import type { State } from '../../../types';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  textTop: string,
  textBottom: string,
};

export class LoginBox extends Component<Props> {
  render() {
    const { textTop, textBottom } = this.props;
    return (
      <div>
        {textTop && (
          <Alert bsStyle="info" className="text-center">
            <WYSIWYGRender value={textTop} />
          </Alert>
        )}
        <LoginSocialButtons />
        <LoginForm />
        {textBottom && <WYSIWYGRender className="text-center excerpt mt-15" value={textBottom} />}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  textTop: state.default.parameters['login.text.top'],
  textBottom: state.default.parameters['login.text.bottom'],
});

export default connect(mapStateToProps)(LoginBox);
