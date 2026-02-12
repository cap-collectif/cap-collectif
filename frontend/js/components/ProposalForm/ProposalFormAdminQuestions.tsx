import * as React from 'react'
import { connect } from 'react-redux'
import { formValueSelector, arrayPush, arrayMove } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'

import styled from 'styled-components' // TODO https://github.com/cap-collectif/platform/issues/7774

// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, ButtonToolbar, Button } from 'react-bootstrap'
import { monitorForElements, draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import ProposalFormAdminQuestionModal from './ProposalFormAdminQuestionModal'
import type { GlobalState, Dispatch } from '~/types'
import { ProposalFormAdminDeleteQuestionModal } from './ProposalFormAdminDeleteQuestionModal'
import { QuestionAdmin } from '../Question/QuestionAdmin'
import SectionQuestionAdminModal from '../Question/SectionQuestionAdminModal'
import FlashMessages from '~/components/Utils/FlashMessages'
import type { QuestionTypeValue } from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql'
import Collapsable from '~ui/Collapsable'
import DropdownSelect from '~ui/DropdownSelect'
import SubSectionQuestionAdminModal from '~/components/Question/SubSectionQuestionAdminModal'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'

type Props = {
  dispatch: Dispatch
  fields: {
    length: number
    map: (...args: Array<any>) => any
    remove: (...args: Array<any>) => any
  }
  questions: Array<Record<string, any>>
  hideSections: boolean
  formName: string
  intl: IntlShape
}
type State = {
  editIndex: number | null | undefined
  editIndexSection: number | null | undefined
  editIndexSubSection: number | null | undefined
  showDeleteModal: boolean
  deleteIndex: number | null | undefined
  deleteType: string | null | undefined
  level: number | null | undefined
  flashMessages: Array<string>
  isDragging: boolean
}
const DraggableWrapper = styled.div<{ isDragging?: boolean }>`
  height: 60px !important;
  opacity: ${props => (props.isDragging ? 0.5 : 1)};
  cursor: grab;

  @media (max-width: 1035px) {
    height: 90px !important;
  }
`
const DraggableContainer = styled(ListGroupItem)<{ isDragging?: boolean }>`
  height: 60px !important;
  background: ${props => (props.isDragging ? '#ddd' : '')};

  @media (max-width: 1035px) {
    height: 90px !important;
  }
`
export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;

  span {
    font-size: 14px;
    font-weight: normal;
    margin-left: 10px;
    margin-right: 12px;
  }

  .dropdown-inside-container {
    display: flex;
  }

  div[role='button'] {
    fill: ${colors.primaryColor};
    display: flex;
    width: max-content;
    border: 1px solid #0388cc;
    color: #0388cc;
    background-color: transparent;
    padding: 5px;
    padding-right: 12px;
    border-radius: 4px;
  }

  .icon-fixed {
    transform: none;
  }

  margin-top: 20px;
  margin-left: 5px;
`
const AddSectionButtonToolbar = styled(ButtonToolbar)<{
  isDragging: boolean
}>`
  margin-top: ${props => props.isDragging && '60px'};

  @media (max-width: 1035px) {
    margin-top: ${props => props.isDragging && '90px'};
  }
`

// TODO: Rename to a more generic name, like FormAdminQuestions
export class ProposalFormAdminQuestions extends React.Component<Props, State> {
  // @ts-ignore eslint-disable-next-line react/sort-comp
  timeoutId: TimeoutID | null | undefined
  cleanupMonitor: (() => void) | null = null
  itemRefs: Map<number, HTMLDivElement> = new Map()
  itemCleanups: Map<number, (() => void)[]> = new Map()

  constructor(props: Props) {
    super(props)
    this.state = {
      editIndex: null,
      editIndexSection: null,
      editIndexSubSection: null,
      deleteIndex: null,
      showDeleteModal: false,
      deleteType: null,
      level: 0,
      flashMessages: [],
      isDragging: false,
    }
    this.timeoutId = null
  }

  componentDidMount() {
    this.setupDragMonitor()
  }

  componentWillUnmount() {
    if (this.cleanupMonitor) {
      this.cleanupMonitor()
    }
    this.itemCleanups.forEach(cleanups => cleanups.forEach(cleanup => cleanup()))
    this.itemCleanups.clear()
  }

  setupDragMonitor = () => {
    const { dispatch, formName } = this.props

    this.cleanupMonitor = monitorForElements({
      onDragStart: () => {
        this.setState({ isDragging: true })
      },
      onDrop: ({ source, location }) => {
        this.setState({ isDragging: false })

        const destination = location.current.dropTargets[0]
        if (!destination) return

        const sourceData = source.data as { index: number }
        const destData = destination.data as { index: number }

        if (sourceData.index !== destData.index) {
          dispatch(arrayMove(formName, 'questions', sourceData.index, destData.index))
        }
      },
    })
  }

  setItemRef = (index: number, element: HTMLDivElement | null) => {
    if (element) {
      this.itemRefs.set(index, element)
      this.setupItemDrag(index, element)
    } else {
      const cleanups = this.itemCleanups.get(index)
      if (cleanups) {
        cleanups.forEach(cleanup => cleanup())
        this.itemCleanups.delete(index)
      }
      this.itemRefs.delete(index)
    }
  }

  setupItemDrag = (index: number, element: HTMLDivElement) => {
    const { questions } = this.props

    // Clean up previous handlers
    const existingCleanups = this.itemCleanups.get(index)
    if (existingCleanups) {
      existingCleanups.forEach(cleanup => cleanup())
    }

    const cleanups: (() => void)[] = []

    cleanups.push(
      draggable({
        element,
        getInitialData: () => ({
          id: questions[index]?.id || `new-question-${index}`,
          index,
        }),
      })
    )

    cleanups.push(
      dropTargetForElements({
        element,
        getData: () => ({
          id: questions[index]?.id || `new-question-${index}`,
          index,
        }),
      })
    )

    this.itemCleanups.set(index, cleanups)
  }

  handleClose = (index: number, isEmpty: boolean) => {
    const { fields, questions } = this.props

    if (!questions[index].id && isEmpty) {
      fields.remove(index)
    }

    this.setState({
      editIndex: null,
      editIndexSection: null,
      editIndexSubSection: null,
    })
  }

  handleClickDelete = (index: number, type: QuestionTypeValue, level?: number | null | undefined) => {
    const deleteType = type === 'section' ? 'section' : 'question'
    const hasLevel = level && level === 1 ? 1 : 0
    this.setState({
      showDeleteModal: true,
      deleteIndex: index,
      deleteType,
      level: hasLevel,
    })
  }

  handleDeleteQuestionRow = (index: number) => {
    const { fields } = this.props
    fields.remove(index)
  }

  handleDeleteAction = () => {
    const { deleteIndex, flashMessages, deleteType, level } = this.state
    const { fields } = this.props
    fields.remove(deleteIndex)

    const createSuccessMsgId = (() => {
      if (deleteType === 'section') {
        if (level) {
          return 'your-sub-section-has-been-deleted'
        }

        return 'your-section-has-been-deleted'
      }

      return 'your-question-has-been-deleted'
    })()

    flashMessages.push(createSuccessMsgId)
    this.setState(
      {
        showDeleteModal: false,
        deleteIndex: null,
        flashMessages,
      },
      () => {
        if (this.timeoutId !== null) {
          clearTimeout(this.timeoutId)
        }

        this.timeoutId = setTimeout(() => {
          this.setState({
            flashMessages: [],
          })
          this.timeoutId = null
        }, 5000)
      },
    )
  }

  handleClickEdit = (index: number, type: QuestionTypeValue, level?: number | null | undefined) => {
    if (type === 'section' && level && level === 1) {
      this.setState({
        editIndexSubSection: index,
        level,
      })
    } else if (type === 'section') {
      this.setState({
        editIndexSection: index,
      })
    } else {
      this.setState({
        editIndex: index,
      })
    }
  }

  handleSubmit = (type: QuestionTypeValue, level?: number) => {
    const createSuccessMsgId = (() => {
      if (type === 'section') {
        if (level && level === 1) {
          return 'your-sub-section-has-been-registered'
        }

        return 'your-section-has-been-registered'
      }

      return 'your-question-has-been-registered'
    })()

    const { flashMessages } = this.state
    flashMessages.push(createSuccessMsgId)
    this.setState(
      {
        editIndex: null,
        editIndexSection: null,
        editIndexSubSection: null,
        flashMessages,
      },
      () => {
        if (this.timeoutId !== null) {
          clearTimeout(this.timeoutId)
        }

        this.timeoutId = setTimeout(() => {
          this.setState({
            flashMessages: [],
          })
          this.timeoutId = null
        }, 5000)
      },
    )
  }

  handleCreateQuestion = () => {
    const { fields, formName, dispatch } = this.props
    dispatch(
      arrayPush(formName, 'questions', {
        private: false,
        required: false,
        descriptionUsingJoditWysiwyg: true,
      }),
    )
    this.setState({
      editIndex: fields.length,
    })
  }

  handleCreateSection = () => {
    const { fields, formName, dispatch } = this.props
    dispatch(
      arrayPush(formName, 'questions', {
        private: false,
        required: false,
        type: 'section',
        level: 0,
        descriptionUsingJoditWysiwyg: true,
      }),
    )
    this.setState({
      editIndexSection: fields.length,
    })
  }

  handleCreateSubSection = () => {
    const { fields, formName, dispatch } = this.props
    dispatch(
      arrayPush(formName, 'questions', {
        private: false,
        required: false,
        type: 'section',
        level: 1,
        descriptionUsingJoditWysiwyg: true,
      }),
    )
    this.setState({
      editIndexSubSection: fields.length,
    })
  }

  handleCancelModal = () => {
    this.setState({
      showDeleteModal: false,
      deleteIndex: null,
    })
  }

  renderQuestionAndSectionButton = (hideSections: boolean, intl: IntlShape) => {
    if (hideSections) {
      return (
        <Button
          id="js-btn-create-question"
          bsStyle="primary"
          className="btn-outline-primary box-content__toolbar"
          onClick={this.handleCreateQuestion}
        >
          <i className="cap cap-bubble-add-2" /> <FormattedMessage id="question_modal.create.title" />
        </Button>
      )
    }

    return (
      <ButtonContainer>
        <Collapsable>
          <Collapsable.Button>
            <div id="perso-field-add">
              <Icon name={ICON_NAME.addCircle} size={16} color={colors.primaryColor} className="icon-fixed" />
              <FormattedMessage id="admin.global.add" />
            </div>
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({
              id: 'admin.global.add',
            })}
          >
            <DropdownSelect
              onChange={value => {
                switch (value) {
                  case 'section':
                    this.handleCreateSection()
                    break

                  case 'sub-section':
                    this.handleCreateSubSection()
                    break

                  default:
                    this.handleCreateQuestion()
                    break
                }
              }}
            >
              <DropdownSelect.Choice value="section" hasBody>
                <Icon name={ICON_NAME.textStyle} size={16} color="#999999" className="create-section" />
                {/** @ts-ignore */}
                <FormattedMessage id="create-section" hasBody />
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="sub-section" hasBody className="create-sub-section">
                <Icon name={ICON_NAME.smallCaps} size={16} color="#999999" />
                {/** @ts-ignore */}
                <FormattedMessage id="create-sub-section" hasBody />
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="question" hasBody className="create-question">
                <Icon name={ICON_NAME.askBubble} size={16} color="#999999" />
                <FormattedMessage id="question_modal.create.title" />
              </DropdownSelect.Choice>
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </ButtonContainer>
    )
  }

  render() {
    const { fields, questions, formName, hideSections, intl, dispatch } = this.props
    const {
      editIndex,
      showDeleteModal,
      editIndexSection,
      editIndexSubSection,
      deleteType,
      level,
      flashMessages,
      isDragging,
    } = this.state
    return (
      <div className="form-group" id="proposal_form_admin_questions_panel_personal">
        <ProposalFormAdminDeleteQuestionModal
          isShow={showDeleteModal}
          level={level}
          cancelAction={this.handleCancelModal}
          deleteAction={this.handleDeleteAction}
          deleteType={deleteType || 'question'}
        />
        <ListGroup>
          <div>
            {fields.length === 0 && (
              <div>
                <FormattedMessage id="highlighted.empty" />
              </div>
            )}
            {fields.map((member, index: number) => (
              <DraggableWrapper
                key={questions[index]?.id || `new-question-${index}`}
                ref={(el: HTMLDivElement | null) => this.setItemRef(index, el)}
                isDragging={isDragging}
                style={{ userSelect: 'none' }}
              >
                <DraggableContainer key={index}>
                  {/** @ts-ignore */}
                  <ProposalFormAdminQuestionModal
                    isCreating={!!questions[index].id}
                    onClose={(isEmpty: boolean) => {
                      this.handleClose.call(this, index, isEmpty)
                    }}
                    onSubmit={this.handleSubmit.bind(this, questions[index].type, questions[index].level)}
                    member={member}
                    show={index === editIndex}
                    formName={formName}
                    questionsIds={questions.map(q => q.id)}
                  />
                  <SectionQuestionAdminModal
                    // @ts-ignore
                    show={index === editIndexSection}
                    member={member}
                    isCreating={!!questions[index].id}
                    onClose={(isEmpty: boolean) => {
                      this.handleClose.call(this, index, isEmpty)
                    }}
                    onSubmit={this.handleSubmit.bind(this, questions[index].type, questions[index].level)}
                    formName={formName}
                  />
                  <SubSectionQuestionAdminModal // @ts-ignore
                    show={index === editIndexSubSection}
                    member={member}
                    isCreating={!!questions[index].id}
                    onClose={(isEmpty: boolean) => {
                      this.handleClose.call(this, index, isEmpty)
                    }}
                    onSubmit={this.handleSubmit.bind(this, questions[index].type, questions[index].level)}
                    formName={formName}
                  />
                  <QuestionAdmin
                    handleClickEdit={this.handleClickEdit}
                    handleClickDelete={this.handleClickDelete}
                    handleDeleteQuestionRow={this.handleDeleteQuestionRow}
                    index={index}
                    dispatch={dispatch}
                    formName={formName} // @ts-ignore
                    questions={questions}
                  />
                </DraggableContainer>
              </DraggableWrapper>
            ))}
          </div>
        </ListGroup>
        <AddSectionButtonToolbar isDragging={isDragging}>
          {this.renderQuestionAndSectionButton(hideSections, intl)}
        </AddSectionButtonToolbar>
        <FlashMessages className="mt-15" success={flashMessages} />
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName)
  return {
    questions: selector(state, 'questions'),
  }
}

export default connect(mapStateToProps)(injectIntl(ProposalFormAdminQuestions))
