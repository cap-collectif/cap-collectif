// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { formValueSelector, arrayPush } from 'redux-form';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';

import type { GlobalState, Dispatch } from '~/types';
import ProposalFormAdminDistrictModal from './ProposalFormAdminDistrictModal';
import type { District } from './ProposalFormAdminDistrictModal';

const formName = 'proposal-form-admin-configuration';
const selector = formValueSelector(formName);

type Props = {
  defaultLanguage: string,
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  districts: $ReadOnlyArray<District>,
};

type State = { editIndex: ?number };

export class ProposalFormAdminDistricts extends React.Component<Props, State> {
  state = {
    editIndex: null,
  };

  handleClose = (index: number) => {
    const { fields, districts } = this.props;

    if (districts[index] && !districts[index].name) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleSubmit = () => {
    const { editIndex } = this.state;
    const { fields, districts } = this.props;

    if (editIndex && districts[editIndex] && !districts[editIndex].name) {
      fields.remove(editIndex);
    }

    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, districts } = this.props;
    const { editIndex } = this.state;

    return (
      <div className="form-group">
        <span
          className="control-label mb-15 mt-15"
          style={{ display: 'block', fontWeight: 'bold' }}>
          <FormattedMessage id="proposal_form.admin.configuration.district_list" />
        </span>
        <ListGroup>
          {fields.map((member, index) => {
            const district = districts[index];
            return (
              <ListGroupItem key={index}>
                <ProposalFormAdminDistrictModal
                  isCreating={!!district}
                  district={district}
                  onClose={() => {
                    this.handleClose(index);
                  }}
                  onSubmit={this.handleSubmit}
                  member={member}
                  show={index === editIndex}
                  formName={formName}
                />
                <Row>
                  <Col xs={8}>
                    <div>
                      <strong>{district.name}</strong>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <ButtonToolbar className="pull-right">
                      <Button
                        bsStyle="warning"
                        className="btn-outline-warning"
                        onClick={() => {
                          this.setState({ editIndex: index });
                        }}>
                        <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                      </Button>
                      <Button
                        bsStyle="danger"
                        className="btn-outline-danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Êtes-vous sûr de vouloir supprimer cette zone ?',
                              'Les propositions liées ne seront pas supprimées. Cette action est irréversible.',
                            )
                          ) {
                            fields.remove(index);
                          }
                        }}>
                        <i className="fa fa-trash" />
                      </Button>
                    </ButtonToolbar>
                  </Col>
                </Row>
              </ListGroupItem>
            );
          })}
        </ListGroup>
        <Button
          style={{ marginBottom: 5 }}
          bsStyle="primary"
          className="btn-outline-primary box-content__toolbar"
          onClick={() => {
            dispatch(arrayPush(formName, 'districts', {}));
            this.setState({ editIndex: fields.length });
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  defaultLanguage: state.language.currentLanguage,
  districts: selector(state, 'districts'),
});

export default connect(mapStateToProps)(ProposalFormAdminDistricts);
