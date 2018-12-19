// @flow
import React from 'react';
import { injectIntl } from 'react-intl';
import { FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { changeOrderBy } from '../../../../redux/modules/project';
import type { GlobalState } from '../../../../types';

type Props = {
  dispatch: Dispatch,
  orderBy: string,
  intl: Object,
};

class ProjectListFilterOrder extends React.Component<Props> {
  render() {
    const { dispatch, orderBy, intl } = this.props;
    return (
      <FormControl
        id="project-sorting"
        componentClass="select"
        type="select"
        name="orderBy"
        value={orderBy}
        onChange={e => {
          dispatch(changeOrderBy(e.target.value));
        }}>
        <option key="date" value="LATEST">
          {intl.formatMessage({ id: 'project.sort.last' })}
        </option>
        <option key="popularity" value="POPULAR">
          {intl.formatMessage({ id: 'global.filter_f_popular' })}
        </option>
      </FormControl>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  orderBy: state.project.orderBy || 'LATEST',
});

export default connect(mapStateToProps)(injectIntl(ProjectListFilterOrder));
