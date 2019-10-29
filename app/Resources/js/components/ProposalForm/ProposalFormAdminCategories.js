// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { formValueSelector, arrayPush, change } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import ProposalFormAdminCategoriesStepModal from './ProposalFormAdminCategoriesStepModal';
import type { GlobalState, Dispatch } from '../../types';
import type { ProposalFormAdminCategories_query } from '~relay/ProposalFormAdminCategories_query.graphql';

const formName = 'proposal-form-admin-configuration';
const selector = formValueSelector(formName);

type Props = {|
  intl: IntlShape,
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  categories: Array<Object>,
  query: ProposalFormAdminCategories_query,
|};

type State = {| editIndex: ?number, defaultCategories: Array<Object> |};

export class ProposalFormAdminCategories extends React.Component<Props, State> {
  state = {
    editIndex: null,
    defaultCategories: this.props.categories,
  };

  handleClose = (index: number, dispatch: Dispatch, member: string, isUpdating: boolean) => {
    const { fields, categories } = this.props;
    const { defaultCategories } = this.state;

    if (
      !isUpdating &&
      defaultCategories[index] &&
      defaultCategories[index].id &&
      categories[index].id &&
      categories[index].id === defaultCategories[index].id
    ) {
      dispatch(change(formName, `${member}.newCategoryImage`, null));
      dispatch(
        change(
          formName,
          `${member}.categoryImage`,
          defaultCategories[index].categoryImage || defaultCategories[index].customCategoryImage,
        ),
      );
    }

    if (!categories[index].id) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleSubmit = () => {
    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, categories, intl, query } = this.props;
    const { editIndex } = this.state;
    return (
      <div className="form-group">
        <span className="control-label mb-15 mt-15">
          <FormattedMessage id="proposal_form.admin.configuration.categories_list" />
        </span>
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <ProposalFormAdminCategoriesStepModal
                isUpdating={!!categories[index].id}
                onClose={() => {
                  this.handleClose(index, dispatch, member, !!categories[index].id);
                }}
                onSubmit={this.handleSubmit}
                member={member}
                show={index === editIndex}
                query={query}
                formName={formName}
                category={categories[index]}
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
                            intl.formatMessage({ id: 'confirm-delete-category' }),
                            intl.formatMessage({
                              id: 'proposals-will-not-be-removed-this-action-is-irreversible',
                            }),
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
          ))}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="btn-outline-primary box-content__toolbar mb-5"
          onClick={() => {
            dispatch(arrayPush(formName, 'categories', {}));
            this.setState({ editIndex: fields.length });
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  categories: selector(state, 'categories'),
});
const container = connect(mapStateToProps)(ProposalFormAdminCategories);

export default createFragmentContainer(injectIntl(container), {
  query: graphql`
    fragment ProposalFormAdminCategories_query on Query {
      ...ProposalFormAdminCategoriesStepModal_query
    }
  `,
});
