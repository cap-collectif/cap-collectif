// @flow
import * as React from 'react';

type Props = {
  isEnable: boolean,
};

type State = {
  isPanelOpen: boolean,
};

const getOpacityValues = () => {
  const opacityValues = [];
  for (let index = 0; index <= 100; index++) {
    opacityValues.push(index);
  }

  return opacityValues;
};

const withPanelStyle = (Component: React.ComponentType<any>) =>
  class extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        isPanelOpen: !!props.isEnable,
      };
    }

    handlePanelToggle = () => {
      this.setState({ isPanelOpen: !this.state.isPanelOpen });
    };

    render() {
      const { isPanelOpen } = this.state;

      return (
        <Component
          {...this.props}
          opacities={getOpacityValues()}
          isPanelOpen={isPanelOpen}
          handlePanelToggle={this.handlePanelToggle}
        />
      );
    }
  };

export default withPanelStyle;
