// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import type { GlobalState } from '../../types';

type Props = {
  backgroundColor: string,
  labelColor: string,
};

// HOC to add backgroundColor and labelColor into the props of a component.
const withColors = (Component: React.ComponentType<any>) => {
  class ComponentWithColors extends React.Component<Props> {
    render() {
      return <Component {...this.props} />;
    }
  }

  const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
    backgroundColor: state.default.parameters['color.btn.primary.bg'],
    labelColor: state.default.parameters['color.btn.primary.text'],
  });

  return connect(mapStateToProps)(ComponentWithColors);
};

export default withColors;
