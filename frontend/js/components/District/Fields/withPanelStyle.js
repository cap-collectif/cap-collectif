// @flow
import * as React from 'react';

type Props = {
  isEnabled: boolean,
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
        isPanelOpen: !!props.isEnabled,
      };
    }

    handlePanelToggle = () => {
      const { isPanelOpen } = this.state;
      this.setState({ isPanelOpen: !isPanelOpen });
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
