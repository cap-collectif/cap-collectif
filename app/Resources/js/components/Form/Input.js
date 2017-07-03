// @flow
import React from 'react';
import autosize from 'autosize';
import ReactBootstrapInput from './ReactBootstrapInput';

export default class Input extends ReactBootstrapInput {
  componentDidMount() {
    const { type } = this.props;
    if (type === 'textarea') {
      autosize(this.getDOMNode());
    }
  }

  componentDidUpdate() {
    const { type } = this.props;
    if (type === 'textarea') {
      autosize(this.getDOMNode());
    }
  }

  componentWillUnmount() {
    const { type } = this.props;
    if (type === 'textarea') {
      autosize.destroy(this.getDOMNode());
    }
  }
}

Input.PropTypes = {
  errors: React.PropTypes.node,
  image: React.PropTypes.string,
  medias: React.PropTypes.array,
};

Input.defaultProps = {
  errors: null,
  labelClassName: 'h5',
  image: null,
  medias: [],
};
