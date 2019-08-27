// @flow
/* eslint-disable flowtype/no-types-missing-file-annotation */
// TODO activer flow
import * as React from 'react';
import { connect } from 'react-redux';
import type { GlobalState } from '../../types';

type Props = {
  backgroundColor: string,
  labelColor: string,
  sectionColor: string,
  bodyColor: string,
};

// HOC to add backgroundColor and labelColor into the props of a component.
const withColors = (Component: React.ComponentType<any>) => {
  class ComponentWithColors extends React.Component<Props> {
    render() {
      return <Component {...this.props} />;
    }
  }

  const mapStateToProps = (state: GlobalState) => ({
    backgroundColor: state.default.parameters['color.btn.primary.bg'],
    labelColor: state.default.parameters['color.btn.primary.text'],
    sectionColor: state.default.parameters['color.section.bg'],
    bodyColor: state.default.parameters['color.body.bg'],
  });

  return connect(mapStateToProps)(ComponentWithColors);
};

export default withColors;
