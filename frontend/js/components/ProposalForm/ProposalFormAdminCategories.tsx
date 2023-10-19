import * as React from 'react'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import { formValueSelector, arrayPush, change } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import styled from 'styled-components' // TODO https://github.com/cap-collectif/platform/issues/7774

// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap'
import ProposalFormAdminCategoriesStepModal from './ProposalFormAdminCategoriesStepModal'
import type { GlobalState, Dispatch, FeatureToggles } from '../../types'
import type { ProposalFormAdminCategories_query } from '~relay/ProposalFormAdminCategories_query.graphql'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

const Preview = styled.div<{
  color: string
}>`
  display: flex;
  align-items: center;

  > div {
    background: ${({ color }) => color};
    width: 24px;
    height: 24px;
    ${MAIN_BORDER_RADIUS};
    margin-right: 10px;
    padding-left: 6px;
    padding-top: 1px;
  }
`
const formName = 'proposal-form-admin-configuration'
const selector = formValueSelector(formName)
type Props = {
  intl: IntlShape
  dispatch: Dispatch
  fields: {
    length: number
    map: (...args: Array<any>) => any
    remove: (...args: Array<any>) => any
  }
  categories: Array<Record<string, any>>
  query: ProposalFormAdminCategories_query
  features: FeatureToggles
}
type State = {
  editIndex: number | null | undefined
  defaultCategories: Array<Record<string, any>>
}
export class ProposalFormAdminCategories extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      editIndex: null,
      defaultCategories: props.categories,
    }
  }

  handleClose = (index: number, dispatch: Dispatch, member: string, isUpdating: boolean) => {
    const { fields, categories } = this.props
    const { defaultCategories } = this.state

    if (
      !isUpdating &&
      defaultCategories[index] &&
      defaultCategories[index].id &&
      categories[index].id &&
      categories[index].id === defaultCategories[index].id
    ) {
      dispatch(change(formName, `${member}.newCategoryImage`, null))
      dispatch(
        change(
          formName,
          `${member}.categoryImage`,
          defaultCategories[index].categoryImage || defaultCategories[index].customCategoryImage,
        ),
      )
    }

    if (!categories[index].id) {
      fields.remove(index)
    }

    this.handleSubmit()
  }

  handleSubmit = () => {
    this.setState({
      editIndex: null,
    })
  }

  render() {
    const { dispatch, fields, categories, intl, query, features } = this.props
    const { editIndex } = this.state
    const usedColors: Array<string | null | undefined> = categories.map(c => c.color)
    const usedIcons: Array<string | null | undefined> = categories.map(c => c.icon)
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
                // @ts-ignore
                onClose={() => {
                  this.handleClose(index, dispatch, member, !!categories[index].id)
                }} // @ts-ignore
                onSubmit={this.handleSubmit}
                member={member}
                show={index === editIndex}
                query={query}
                formName={formName} // @ts-ignore
                category={categories[index]}
                colors={query.proposalCategoryOptions.colors.map(color => color.replace('COLOR_', '#').toLowerCase())}
                icons={query.proposalCategoryOptions.icons.map(icon => icon.toLowerCase().replace(/_/g, '-'))}
                usedColors={usedColors}
                usedIcons={usedIcons}
              />
              <Row
                className="d-flex"
                style={{
                  alignItems: 'center',
                }}
              >
                <Col xs={8}>
                  <Preview color={categories[index].color}>
                    {features.display_pictures_in_depository_proposals_list && (
                      <div>
                        {categories[index].icon && (
                          <Icon name={ICON_NAME[categories[index].icon]} size={12} color={colors.white} />
                        )}
                      </div>
                    )}
                    <strong>{categories[index].name}</strong>
                  </Preview>
                </Col>
                <Col xs={4}>
                  <ButtonToolbar className="pull-right">
                    <Button
                      bsStyle="warning"
                      className="btn-outline-warning"
                      onClick={() => {
                        this.setState({
                          editIndex: index,
                        })
                      }}
                    >
                      <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                    </Button>
                    <Button
                      bsStyle="danger"
                      className="btn-outline-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            intl.formatMessage({
                              id: 'confirm-delete-category',
                            }), // @ts-ignore
                            intl.formatMessage({
                              id: 'proposals-will-not-be-removed-this-action-is-irreversible',
                            }),
                          )
                        ) {
                          fields.remove(index)
                        }
                      }}
                    >
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
            dispatch(arrayPush(formName, 'categories', {}))
            this.setState({
              editIndex: fields.length,
            })
          }}
        >
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  categories: selector(state, 'categories'),
  features: state.default.features,
})

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(ProposalFormAdminCategories)
export default createFragmentContainer(injectIntl(container), {
  query: graphql`
    fragment ProposalFormAdminCategories_query on Query {
      ...ProposalFormAdminCategoriesStepModal_query
      proposalCategoryOptions {
        colors
        icons
      }
    }
  `,
})
