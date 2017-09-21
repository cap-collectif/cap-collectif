// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, arrayPush } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import {
  ListGroup,
  ListGroupItem,
  ButtonToolbar,
  Button,
  Row,
  Col,
  Glyphicon,
} from 'react-bootstrap';
import ProposalFormAdminDistrictModal from './ProposalFormAdminDistrictModal';
import type { GlobalState, Dispatch } from '../../types';

const formName = 'proposal-form-admin-configuration';
const selector = formValueSelector(formName);

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  districts: Array<Object>,
};
type State = { editIndex: ?number };

export class ProposalFormAdminDistricts extends React.Component<Props, State> {
  state = {
    editIndex: null,
  };

  handleClose = (index: number) => {
    const { fields, districts } = this.props;
    if (!districts[index].id) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleSubmit = () => {
    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, districts } = this.props;
    const { editIndex } = this.state;
    return (
      <div className="form-group">
        <label style={{ marginBottom: 15, marginTop: 15 }}>Liste des zones géographiques</label>
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <ProposalFormAdminDistrictModal
                isCreating={!!districts[index].id}
                onClose={() => {
                  this.handleClose(index);
                }}
                onSubmit={this.handleSubmit}
                member={member}
                show={index === editIndex}
              />
              <Row>
                <Col xs={8}>
                  <div>
                    <strong>{districts[index].name}</strong>
                  </div>
                </Col>
                <Col xs={4}>
                  <ButtonToolbar className="pull-right">
                    <Button
                      bsStyle="warning"
                      onClick={() => {
                        this.setState({ editIndex: index });
                      }}>
                      <Glyphicon glyph="pencil" /> <FormattedMessage id="global.edit" />
                    </Button>
                    <Button
                      bsStyle="danger"
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
                      <Glyphicon glyph="trash" />
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
        <Button
          style={{ marginBottom: 10 }}
          bsStyle="primary"
          onClick={() => {
            dispatch(arrayPush(formName, 'districts', {}));
            this.setState({ editIndex: fields.length });
          }}>
          <Glyphicon glyph="plus" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  districts: selector(state, 'districts'),
});

export default connect(mapStateToProps)(ProposalFormAdminDistricts);
