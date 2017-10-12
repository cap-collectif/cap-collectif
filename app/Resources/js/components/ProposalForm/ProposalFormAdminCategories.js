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
import ProposalFormAdminCategoriesStepModal from './ProposalFormAdminCategoriesStepModal';
import type { GlobalState, Dispatch } from '../../types';

const formName = 'proposal-form-admin-configuration';
const selector = formValueSelector(formName);

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  categories: Array<Object>,
};
type State = { editIndex: ?number };

export class ProposalFormAdminCategories extends React.Component<Props, State> {
  state = {
    editIndex: null,
  };

  handleClose = (index: number) => {
    // eslint-disable-next-line react/prop-types
    const { fields, categories } = this.props;
    if (!categories[index].id) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleSubmit = () => {
    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, categories } = this.props;
    const { editIndex } = this.state;
    return (
      <div className="form-group">
        <label style={{ marginBottom: 15, marginTop: 15 }}>Liste des catégories</label>
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <ProposalFormAdminCategoriesStepModal
                isCreating={!!categories[index].id}
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
                    <strong>{categories[index].name}</strong>
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
                            'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
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
            dispatch(arrayPush(formName, 'categories', {}));
            this.setState({ editIndex: fields.length });
          }}>
          <Glyphicon glyph="plus" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  categories: selector(state, 'categories'),
});

export default connect(mapStateToProps)(ProposalFormAdminCategories);
