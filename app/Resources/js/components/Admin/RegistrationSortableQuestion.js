// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button, ListGroupItem } from 'react-bootstrap';
import { SortableElement } from 'react-sortable-hoc';
import { updateRegistrationFieldModal, deleteRegistrationField } from '../../redux/modules/default';
import type { State, Dispatch } from '../../types';
import DragHandle from './DragHandle';

type ParentProps = { value: Object };
type Props = {
  isSuperAdmin: boolean,
  value: Object,
  deleteField: () => void,
  updateField: () => void
};

export const RegistrationSortableQuestion = React.createClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    isSuperAdmin: PropTypes.bool.isRequired,
    deleteField: PropTypes.func.isRequired,
    updateField: PropTypes.func.isRequired
  },

  render() {
    const { value, isSuperAdmin, deleteField, updateField } = this.props;
    return (
      <ListGroupItem className="row" style={{ marginRight: 0, marginLeft: 0 }}>
        <div className="col-xs-1">
          <DragHandle />
        </div>
        <div className="col-xs-8">
          <strong>{value.question}</strong>
          <div>
            <FormattedMessage id={`global.question.types.${value.type}`} />
          </div>
        </div>
        <div className="col-xs-3">
          <Button
            className="pull-right"
            disabled={!isSuperAdmin}
            onClick={!isSuperAdmin ? null : () => deleteField()}>
            <FormattedMessage id="glodal.delete" />
          </Button>
          <Button
            disabled={!isSuperAdmin}
            style={{ marginRight: 5 }}
            className="pull-right"
            onClick={!isSuperAdmin ? null : () => updateField()}>
            <FormattedMessage id="glodal.edit" />
          </Button>
        </div>
      </ListGroupItem>
    );
  }
});

const mapStateToProps = (state: State) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN'))
});
const mapDispatchToProps = (dispatch: Dispatch, props: ParentProps) => ({
  updateField: () => {
    dispatch(updateRegistrationFieldModal(props.value.id));
  },
  deleteField: () => {
    deleteRegistrationField(props.value.id, dispatch);
  }
});
const connector: Connector<ParentProps, Props> = connect(mapStateToProps, mapDispatchToProps);
export default SortableElement(connector(RegistrationSortableQuestion));
