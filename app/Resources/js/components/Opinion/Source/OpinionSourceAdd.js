// @flow
import React from 'react';
import { connect } from 'react-redux';
import OpinionSourceAddButton from './OpinionSourceAddButton';
import OpinionSourceFormModal from './OpinionSourceFormModal';
import { showSourceCreateModal } from '../../../redux/modules/opinion';

type Props = {
  disabled?: boolean,
  dispatch: Function,
};

class OpinionSourceAdd extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  render() {
    const { disabled, dispatch } = this.props;
    return (
      <div>
        <OpinionSourceAddButton
          disabled={disabled}
          handleClick={() => {
            dispatch(showSourceCreateModal());
          }}
        />
        {!disabled && <OpinionSourceFormModal source={null} />}
      </div>
    );
  }
}

export default connect()(OpinionSourceAdd);
