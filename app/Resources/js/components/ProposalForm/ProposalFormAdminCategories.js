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
// import ProposalAdminRealisationStepModal from './ProposalAdminRealisationStepModal';
import type { GlobalState, Dispatch } from '../../types';

const formName = 'proposal-form-admin-categories';
const selector = formValueSelector(formName);

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  categories: Array<Object>,
};
type DefaultProps = void;
type State = { editIndex: ?number };

export class ProposalFormAdminCategories extends React.Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    // eslint-disable-next-line react/prop-types
    const { dispatch, fields, categories } = this.props;
    return (
      <div className="form-group">
        <label>Liste des catégories</label>
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
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
                      <FormattedMessage id="global.edit" />
                    </Button>
                    <Button
                      bsStyle="danger"
                      onClick={() => {
                        // eslint-disable-next-line no-confirm
                        if (
                          window.confirm(
                            'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
                            'Les propositions liées ne seront pas supprimées. Cette action est irréversible.',
                          )
                        ) {
                          fields.remove(index);
                        }
                      }}>
                      <FormattedMessage id="global.remove" />
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
        <Button
          style={{ marginBottom: 10 }}
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
