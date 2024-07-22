import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { connect, useSelector } from 'react-redux'
import type { RelayPaginationProp } from 'react-relay'
import { createPaginationContainer, graphql } from 'react-relay'
import { useState } from 'react'
import type { ProjectAdminProposals_project } from '~relay/ProjectAdminProposals_project.graphql'
import type { ProjectAdminProposals_themes } from '~relay/ProjectAdminProposals_themes.graphql'
import PickableList from '~ui/List/PickableList'
import { usePickableList } from '~ui/List/PickableList/usePickableList'
import * as S from './ProjectAdminProposals.style'
import DropdownSelect from '~ui/DropdownSelect'
import Collapsable from '~ui/Collapsable'
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context'
import type {
  Action,
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  ProposalsThemeValues,
  ProposalsStateValues,
  ProposalsStatusValues,
  ProposalsStepValues,
  SortValues,
} from '~/components/Admin/Project/ProjectAdminPage.reducer'
import type { State, Uuid } from '~/types'
import InlineSelect from '~ui/InlineSelect'
import type { StepFilter } from '~/components/Admin/Project/ProjectAdminProposals.utils'
import {
  getAllFormattedChoicesForProject,
  getFormattedCollectStepsForProject,
  getDifferenceFilters,
  getWordingEmpty,
  isStatusIndeterminate,
  getCommonStatusIdWithinProposalIds,
  isStepIndeterminate,
  getCommonStepIdWithinProposalIds,
  getStepDisplay,
  getFormattedStepsChoicesForProject,
} from '~/components/Admin/Project/ProjectAdminProposals.utils'
import ClearableInput from '~ui/Form/Input/ClearableInput'
import FilterTag from '~ui/Analysis/FilterTag'
import {
  AnalysisPickableListContainer,
  AnalysisProposalListHeaderContainer,
  AnalysisProposalListFiltersContainer,
  AnalysisProposalListFiltersAction,
  AnalysisProposalListFiltersList,
} from '~ui/Analysis/common.style'
import AddProposalsToStepsMutation from '~/mutations/AddProposalsToStepsMutation'
import ApplyProposalStatusMutation from '~/mutations/ApplyProposalStatusMutation'
import RemoveProposalsFromStepsMutation from '~/mutations/RemoveProposalsFromStepsMutation'
import ProjectAdminMergeModale from '~/components/Admin/Project/Modale/ProjectAdminMergeModale'
import AnalysisNoProposal from '~/components/Analysis/AnalysisNoProposal/AnalysisNoProposal'
import AnalysisFilterSort from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort'
import AnalysisFilterCategory from '~/components/Analysis/AnalysisFilter/AnalysisFilterCategory'
import AnalysisFilterDistrict from '~/components/Analysis/AnalysisFilter/AnalysisFilterDistrict'
import type { ThemeFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme'
import AnalysisFilterTheme from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme'
import AnalysisProposal from '~/components/Analysis/AnalysisProposal/AnalysisProposal'
import ImportButton from '~/components/Admin/Project/ImportButton/ImportButton'
import ModalDeleteProposal from '~/components/Admin/Project/ModalDeleteProposal/ModalDeleteProposal'
import type { AnalysisProposal_proposal } from '~relay/AnalysisProposal_proposal.graphql'
import NewExportButton from '~/components/Admin/Project/ExportButton/NewExportButton'
import useLoadingMachine from '~/utils/hooks/useLoadingMachine'
import useToastingMachine from '~/utils/hooks/useToastingMachine'
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup'
import type { StepStatusFilter } from '~/components/Admin/Project/ProjectAdminProposals.utils'
import ImportPaperVotesFromCsvModal from '~/components/Admin/Project/ImportButton/ImportPaperVotesFromCsvModal'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { colorsData } from '~/utils/colors'
import {
  Button,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  Heading,
  Icon,
  Modal,
  Text,
  clearToasts,
  toast,
} from '@cap-collectif/ui'
export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30
export const PROJECT_ADMIN_PROPOSAL_LOAD_100 = 100
const STATE_RESTRICTED = ['DRAFT', 'TRASHED']
type Props = {
  readonly viewerIsAdmin: boolean
  readonly relay: RelayPaginationProp
  readonly project: ProjectAdminProposals_project
  readonly themes: ProjectAdminProposals_themes
  readonly hasContributionsStep: boolean
  readonly baseUrl: string
}
type HeaderProps = {
  readonly project: ProjectAdminProposals_project
  readonly themes: ProjectAdminProposals_themes
}

const displayToastsAfterStepAssignation = (
  stepsAdded: Uuid[],
  stepsRemoved: Uuid[],
  steps: ReadonlyArray<StepFilter>,
  proposals: ReadonlyArray<Uuid>,
  intl: IntlShape,
) => {
  const nbProposals = proposals.length

  if (stepsAdded.length > 0 || stepsRemoved.length > 0) {
    let successMessage = 'proposal-placed-in-step'
    let usedSteps = steps.filter(step => stepsAdded.includes(step.id))

    if (stepsAdded.length >= 1 && stepsRemoved.length >= 1) {
      successMessage = 'proposal-move-to-step'
    } else if (stepsAdded.length < 1 && stepsRemoved.length >= 1) {
      successMessage = 'withdrawn-proposal-step'
      usedSteps = steps.filter(step => stepsRemoved.includes(step.id))
    }

    toast({
      variant: 'success',
      content: intl.formatMessage(
        {
          id: successMessage,
        },
        {
          steps: usedSteps.map(step => step.label).join(', '),
          num: usedSteps.length,
          nbProposals,
        },
      ),
      position: 'top',
    })
  }
}

const assignStepProposals = async (
  stepsAdded: Uuid[],
  stepsRemoved: Uuid[],
  selectedProposalIds: ReadonlyArray<Uuid>,
  intl: IntlShape,
  allSteps: ReadonlyArray<StepFilter>,
) => {
  if (selectedProposalIds.length === 1) {
    toast({
      variant: 'loading',
      content: intl.formatMessage({
        id: 'loading-contributions',
      }),
      position: 'bottom',
    })
  }

  if (stepsAdded.length > 0) {
    AddProposalsToStepsMutation.commit({
      input: {
        proposalIds: selectedProposalIds,
        stepIds: stepsAdded,
      },
      allSteps,
    }).then(response => {
      if (!response.addProposalsToSteps || response.addProposalsToSteps.error) {
        toast({
          variant: 'danger',
          content: intl.formatMessage({
            id: 'moving.contributions.failed',
          }),
        })
      }
    })
  }

  if (stepsRemoved.length > 0) {
    RemoveProposalsFromStepsMutation.commit({
      input: {
        proposalIds: selectedProposalIds,
        stepIds: stepsRemoved,
      },
    }).then(response => {
      if (!response.removeProposalsFromSteps || response.removeProposalsFromSteps.error) {
        toast({
          variant: 'danger',
          content: intl.formatMessage({
            id: 'moving.contributions.failed',
          }),
        })
      }
    })
  }
}

const displaySuccessStatusToast = (selectedProposalIds, intl: IntlShape): void => {
  toast({
    variant: 'success',
    content: intl.formatMessage(
      {
        id: 'proposal-status-change',
      },
      {
        num: selectedProposalIds.length,
      },
    ),
    position: 'top',
  })
}

const assignStatus = async (
  assigneeId: Uuid | null | undefined,
  stepSelected: ProposalsStepValues,
  selectedProposalIds: ReadonlyArray<Uuid>,
  closeDropdown: (() => void) | null | undefined,
  intl: IntlShape,
  allStatuses: ReadonlyArray<StepStatusFilter>,
) => {
  if (closeDropdown) closeDropdown()

  if (selectedProposalIds.length === 1) {
    toast({
      variant: 'loading',
      content: intl.formatMessage({
        id: 'loading-contributions',
      }),
      position: 'bottom',
    })
  }

  ApplyProposalStatusMutation.commit({
    input: {
      proposalIds: selectedProposalIds,
      statusId: assigneeId === 'deleted' ? null : assigneeId,
    },
    step: stepSelected,
    statusSelected: assigneeId === 'deleted' ? null : allStatuses.find(status => status.id === assigneeId),
  }).then(response => {
    if (!response.applyProposalStatus || response.applyProposalStatus.error) {
      return toast({
        variant: 'danger',
        content: intl.formatMessage({
          id: 'status.update.failed',
        }),
      })
    }
  })
  displaySuccessStatusToast(selectedProposalIds, intl)
}

const ProposalListHeader = ({ project, themes = [] }: HeaderProps) => {
  const [isMergeModaleVisible, setIsMergeModaleVisible] = React.useState(false)
  const { selectedRows, rowsCount } = usePickableList()
  const { parameters, dispatch, firstCollectStepId } = useProjectAdminProposalsContext()
  const intl = useIntl()
  const { bgColor } = useSelector((state: State) => ({
    bgColor: state.default.parameters['color.btn.primary.bg'],
  }))
  const { categories, categoriesWithStep, districts, districtsWithStep, steps, stepStatuses, filtersOrdered } =
    React.useMemo(
      () =>
        getAllFormattedChoicesForProject(
          project,
          parameters.filters.step,
          selectedRows,
          parameters.filtersOrdered,
          intl,
          themes,
        ),
      [project, parameters.filters.step, parameters.filtersOrdered, selectedRows, intl, themes],
    )
  const collectSteps = getFormattedCollectStepsForProject(project)
  const selectedStepId: ProposalsStepValues = parameters.filters.step
  const selectedStep: StepFilter = steps.find(({ id }) => id === selectedStepId) as any as StepFilter
  const isRestricted = STATE_RESTRICTED.includes(parameters.filters.state)
  const selectedProposals = project.proposals?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .filter(proposal => {
      const proposalId = proposal.id
      return selectedRows.includes(proposalId)
    })

  /* # ACTION # */
  const [selectionSteps, setSelectionSteps] = React.useState({
    all: [],
    removed: [],
    added: [],
    values: [],
  })
  const [selectedStatus, setSelectedStatus] = React.useState(null)
  const [selectionStatus, setSelectionStatus] = React.useState(null)
  const [openConfirmModal, setOpenConfirmModal] = React.useState(false)
  React.useEffect(() => {
    setSelectionStatus(getCommonStatusIdWithinProposalIds(project, selectedRows))
  }, [project, selectedRows])
  const renderFilters = (
    <>
      {selectedStep?.type === 'CollectStep' && districts?.length > 0 && (
        <AnalysisFilterDistrict
          districts={districts}
          value={parameters.filters.district}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_DISTRICT_FILTER',
              payload: newValue as any as ProposalsDistrictValues,
            })
          }}
        />
      )}

      {selectedStep?.hasTheme && themes?.length > 0 && (
        <AnalysisFilterTheme
          themes={themes as any as ReadonlyArray<ThemeFilter>}
          value={parameters.filters.theme}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_THEME_FILTER',
              payload: newValue as any as ProposalsThemeValues,
            })
          }}
        />
      )}

      {selectedStep?.type === 'SelectionStep' && districtsWithStep?.length > 0 && (
        <Collapsable align="right">
          <Collapsable.Button>
            {intl.formatMessage({
              id: 'admin.fields.proposal.map.zone',
            })}
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({
              id: 'admin.fields.proposal.map.zone',
            })}
          >
            <DropdownSelect
              shouldOverflow
              value={parameters.filters.district}
              defaultValue="ALL"
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_DISTRICT_FILTER',
                  payload: newValue as any as ProposalsDistrictValues,
                })
              }}
              title={intl.formatMessage({
                id: 'admin.fields.proposal.map.zone',
              })}
            >
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({
                  id: 'global.select_districts',
                })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="NONE">
                {intl.formatMessage({
                  id: 'global.select_no-districts',
                })}
              </DropdownSelect.Choice>
              {districtsWithStep.map(districtOrStep =>
                districtOrStep.isStep ? (
                  <DropdownSelect.Separator key={districtOrStep.id}>{districtOrStep.name}</DropdownSelect.Separator>
                ) : (
                  <DropdownSelect.Choice key={districtOrStep.id} value={districtOrStep.id}>
                    {districtOrStep.name}
                  </DropdownSelect.Choice>
                ),
              )}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      )}

      {selectedStep?.type === 'CollectStep' && categories?.length > 0 && (
        <AnalysisFilterCategory
          categories={categories}
          value={parameters.filters.category}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_CATEGORY_FILTER',
              payload: newValue as any as ProposalsCategoryValues,
            })
          }}
        />
      )}

      {selectedStep?.type === 'SelectionStep' && categoriesWithStep?.length > 0 && (
        <Collapsable align="right">
          <Collapsable.Button>
            {intl.formatMessage({
              id: 'admin.fields.proposal.category',
            })}
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({
              id: 'admin.fields.proposal.category',
            })}
          >
            <DropdownSelect
              shouldOverflow
              value={parameters.filters.category}
              defaultValue="ALL"
              onChange={newValue =>
                dispatch({
                  type: 'CHANGE_CATEGORY_FILTER',
                  payload: newValue as any as ProposalsCategoryValues,
                })
              }
              title={intl.formatMessage({
                id: 'admin.fields.proposal.category',
              })}
            >
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({
                  id: 'global.select_categories',
                })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="NONE">
                {intl.formatMessage({
                  id: 'global.select_no-categories',
                })}
              </DropdownSelect.Choice>
              {categoriesWithStep.map(categoryOrStep =>
                categoryOrStep.isStep ? (
                  <DropdownSelect.Separator key={categoryOrStep.id}>{categoryOrStep.name}</DropdownSelect.Separator>
                ) : (
                  <DropdownSelect.Choice key={categoryOrStep.id} value={categoryOrStep.id}>
                    {categoryOrStep.name}
                  </DropdownSelect.Choice>
                ),
              )}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      )}

      {stepStatuses?.length > 0 && !isRestricted && (
        <Collapsable align="right" key="status-filter">
          <Collapsable.Button>
            {intl.formatMessage(
              {
                id: 'admin.fields.proposal.status',
              },
              {
                tagName: 'p',
              },
            )}
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({
              id: 'filter-by',
            })}
          >
            <DropdownSelect
              value={parameters.filters.status}
              defaultValue="ALL"
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_STATUS_FILTER',
                  payload: newValue as any as SortValues,
                })
              }}
              title={intl.formatMessage({
                id: 'filter-by',
              })}
            >
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({
                  id: 'global.select_statuses',
                })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="NONE">
                {intl.formatMessage({
                  id: 'global.select_propositions-without-status',
                })}
              </DropdownSelect.Choice>
              {stepStatuses.map(stepStatus => (
                <DropdownSelect.Choice key={stepStatus.id} value={stepStatus.id}>
                  {stepStatus.name}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      )}

      {!isRestricted && (
        <Collapsable align="right" key="step-filter" id="admin_label_step">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="admin.label.step" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({
              id: 'filter-by',
            })}
          >
            <DropdownSelect
              value={parameters.filters.step}
              defaultValue={firstCollectStepId || steps[0].id}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_STEP_FILTER',
                  payload: newValue as any as SortValues,
                })
              }}
              title={intl.formatMessage({
                id: 'filter-by',
              })}
            >
              {steps.map(s => (
                <DropdownSelect.Choice key={s.id} value={s.id}>
                  {s.title}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      )}

      <AnalysisFilterSort
        value={parameters.sort}
        isVoteRanking={selectedStep?.votesRanking || false}
        isVotable={selectedStep?.votable || false}
        canContactAuthor={selectedStep?.form?.canContact}
        onChange={newValue => {
          dispatch({
            type: 'CHANGE_SORT',
            payload: newValue as any as SortValues,
          })
        }}
      />
    </>
  )
  let modalBodyMessage = 'mass-placed-proposals-steps'
  let usedSteps = steps.filter(step => selectionSteps.added.includes(step.id))
  const usedStepsCompleted = steps.filter(step => selectionSteps.removed.includes(step.id))
  let stepsOrStatus = ''
  const stepsOrStatusComplete = usedStepsCompleted.map(step => step.label).join('”, ”')

  if (selectedRows.length > 1) {
    if (selectionSteps.added.length >= 1 || selectionSteps.removed.length >= 1) {
      if (selectionSteps.added.length >= 1 && selectionSteps.removed.length < 1) {
        modalBodyMessage = 'mass-placed-proposals-steps'
      } else if (selectionSteps.added.length === 1 && selectionSteps.removed.length === 1) {
        modalBodyMessage = 'mass-move-proposals-steps'
      } else if (selectionSteps.added.length >= 1 && selectionSteps.removed.length >= 1) {
        modalBodyMessage = 'mass-move-proposals-steps'
      } else if (selectionSteps.added.length < 1 && selectionSteps.removed.length >= 1) {
        modalBodyMessage = 'mass-withdrawn-proposals-steps'
        usedSteps = steps.filter(step => selectionSteps.removed.includes(step.id))
      }

      stepsOrStatus = usedSteps.map(step => step.label).join('”, ”')
    } else if (selectedStatus) {
      if (selectedStatus === 'deleted') {
        modalBodyMessage = 'proposals-confirm-removes-status'
        stepsOrStatus = ''
      } else {
        modalBodyMessage = 'proposals-confirm-change-status'
        usedSteps = stepStatuses.filter(status => status.id === selectedStatus)
        stepsOrStatus = usedSteps.map(step => step.name).join(', ')
      }
    }
  }

  const areOpinions = selectedStep?.form?.objectType === 'OPINION'
  const { isLoading, startLoading, stopLoading } = useLoadingMachine()
  const { startToasting, stopToasting } = useToastingMachine()
  const renderActions = (
    <React.Fragment>
      {selectedRows.length > 1 && parameters.filters.state === 'PUBLISHED' && (
        <>
          <S.MergeButton onClick={() => setIsMergeModaleVisible(true)} id="merge-button">
            {intl.formatMessage({
              id: 'proposal.add_fusion',
            })}
          </S.MergeButton>
          <S.Divider />
        </>
      )}
      <Modal
        ariaLabel="contained-modal-title-lg"
        preventBodyScroll
        scrollBehavior="inside"
        show={openConfirmModal}
        hideOnClickOutside={false}
        hideOnEsc={false}
        hideCloseButton
        size={CapUIModalSize.Md}
        mt="133px"
        width={['100%', '555px']}
      >
        <Modal.Header borderBottom="1px solid #DADEE1" px={6} py={6}>
          <Heading>
            {intl.formatMessage({
              id: 'confirm-grouped-action',
            })}
          </Heading>
        </Modal.Header>
        <Modal.Body p={6}>
          <Text lineHeight="24px" as="div" px={6}>
            <FormattedHTMLMessage
              id={modalBodyMessage}
              values={{
                stepsOrStatus,
                stepsOrStatusComplete,
                num: selectedRows.length,
              }}
            />
          </Text>
        </Modal.Body>
        <Modal.Footer
          as="div"
          py={4}
          px={6}
          align={['stretch', 'center']}
          direction={['column', 'row']}
          borderTop="1px solid #DADEE1"
        >
          <Button
            variant="secondary"
            variantSize="big"
            variantColor="hierarchy"
            justifyContent={['center']}
            disabled={isLoading}
            mr={6}
            onClick={() => setOpenConfirmModal(false)}
          >
            {intl.formatMessage({
              id: 'global.cancel',
            })}
          </Button>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            disabled={isLoading}
            isLoading={isLoading}
            justifyContent={['center', 'flex-start']}
            onClick={() => {
              startLoading()

              if (selectionSteps.added.length >= 1 || selectionSteps.removed.length >= 1) {
                assignStepProposals(selectionSteps.added, selectionSteps.removed, selectedRows, intl, steps).then(
                  () => {
                    setOpenConfirmModal(false)
                    setSelectionSteps({
                      all: [],
                      removed: [],
                      added: [],
                      values: [],
                    })
                    displayToastsAfterStepAssignation(
                      selectionSteps.added,
                      selectionSteps.removed,
                      steps,
                      selectedRows,
                      intl,
                    )
                    stopLoading()
                  },
                )
              } else {
                startToasting()
                assignStatus(selectedStatus, selectedStepId, selectedRows, null, intl, stepStatuses).then(() => {
                  setOpenConfirmModal(false)
                  setSelectedStatus(null)
                  stopToasting()
                  stopLoading()
                })
              }
            }}
          >
            {intl.formatMessage({
              id: 'global.validate',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
      <Collapsable
        align="right"
        onClose={() => {
          if (selectionSteps.added.length >= 1 || selectionSteps.removed.length >= 1) {
            if (selectedRows.length > 1) {
              setOpenConfirmModal(true)
            } else {
              assignStepProposals(selectionSteps.added, selectionSteps.removed, selectedRows, intl, steps).then(() => {
                displayToastsAfterStepAssignation(
                  selectionSteps.added,
                  selectionSteps.removed,
                  steps,
                  selectedRows,
                  intl,
                )
              })
            }
          }
        }}
      >
        <Collapsable.Button>
          <FormattedMessage tagName="p" id="synthesis.edition.action.publish.field.parent" />
        </Collapsable.Button>
        <Collapsable.Element
          ariaLabel={intl.formatMessage({
            id: 'synthesis.edition.action.publish.field.parent',
          })}
        >
          <DropdownSelect
            shouldOverflow
            isMultiSelect
            mode="add-remove"
            title={intl.formatMessage({
              id: 'move.in.step',
            })}
            initialValue={getCommonStepIdWithinProposalIds(project, selectedRows)}
            value={selectionSteps}
            onChange={setSelectionSteps}
          >
            {steps.map(step => (
              <S.ProposalListDropdownChoice
                key={step.id}
                value={step.id}
                isIndeterminate={isStepIndeterminate(project, selectedRows, step.id)}
                disabled={collectSteps.includes(step.id)}
              >
                {step.title}
              </S.ProposalListDropdownChoice>
            ))}
          </DropdownSelect>
        </Collapsable.Element>
      </Collapsable>

      <Collapsable align="right">
        {({ closeDropdown }) => (
          <>
            <Collapsable.Button>
              <FormattedMessage tagName="p" id="admin.fields.proposal.status" />
            </Collapsable.Button>
            <Collapsable.Element
              ariaLabel={intl.formatMessage({
                id: 'admin.fields.proposal.status',
              })}
            >
              <DropdownSelect
                value={selectionStatus}
                onChange={newValue => {
                  setSelectedStatus(newValue ?? 'deleted')

                  if (selectedRows.length > 1) {
                    setOpenConfirmModal(true)
                  } else {
                    startToasting()
                    assignStatus(newValue, selectedStepId, selectedRows, closeDropdown, intl, stepStatuses).then(() => {
                      setTimeout(stopToasting, 3000)
                    })
                  }
                }}
                title={intl.formatMessage({
                  id: 'change.status.to',
                })}
              >
                {stepStatuses.length === 0 && (
                  <DropdownSelect.Message>
                    <S.EmptyStatuses>
                      <Icon name={CapUIIcon.Alert} size={CapUIIconSize.Xs} />
                      <div>
                        <FormattedMessage tagName="p" id="no.filter.available" />
                        <FormattedMessage
                          tagName="span"
                          id="help.add.filters"
                          values={{
                            link_to_step: <a href={project.adminAlphaUrl}>{selectedStep?.title}</a>,
                          }}
                        />
                      </div>
                    </S.EmptyStatuses>
                  </DropdownSelect.Message>
                )}
                {stepStatuses.map(status => (
                  <DropdownSelect.Choice
                    key={status.id}
                    value={status.id}
                    isIndeterminate={isStatusIndeterminate(project, selectedRows, status.id)}
                  >
                    {status.name}
                  </DropdownSelect.Choice>
                ))}
              </DropdownSelect>
            </Collapsable.Element>
          </>
        )}
      </Collapsable>
    </React.Fragment>
  )
  return (
    <React.Fragment>
      {selectedRows.length > 0 ? (
        <React.Fragment>
          <FormattedMessage
            id={areOpinions ? 'admin-opinions-list-selected' : 'admin-proposals-list-selected'}
            tagName="p"
            values={{
              itemCount: selectedRows.length,
            }}
          />
          {renderActions}

          <ProjectAdminMergeModale
            proposalsSelected={selectedProposals}
            onClose={() => setIsMergeModaleVisible(false)}
            show={isMergeModaleVisible}
            dispatch={dispatch}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {rowsCount}{' '}
            {intl.formatMessage({
              id: areOpinions ? 'global.review' : 'global.proposals',
            })}
          </p>
          <AnalysisProposalListFiltersContainer>
            <AnalysisProposalListFiltersAction>{renderFilters}</AnalysisProposalListFiltersAction>
            {filtersOrdered.length > 0 && selectedRows.length === 0 && (
              <AnalysisProposalListFiltersList>
                {filtersOrdered.map(({ id, name, action, icon, color }) => (
                  <FilterTag
                    key={id}
                    onClose={
                      action
                        ? () =>
                            dispatch({
                              type: action,
                            } as any as Action)
                        : null
                    }
                    icon={icon ? <Icon name={icon as CapUIIcon} size={CapUIIconSize.Xs} color="#fff" /> : null}
                    bgColor={color === 'PRIMARY' ? bgColor : color}
                  >
                    {name}
                  </FilterTag>
                ))}
              </AnalysisProposalListFiltersList>
            )}
          </AnalysisProposalListFiltersContainer>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

export const ProjectAdminProposals = ({
  project,
  themes,
  relay,
  baseUrl,
  hasContributionsStep,
  viewerIsAdmin,
}: Props) => {
  const { parameters, dispatch } = useProjectAdminProposalsContext()
  const intl = useIntl()
  const paperVotesEnabled = useFeatureFlag('paper_vote')
  const history = useHistory()
  const hasProposals = project.proposals?.totalCount > 0
  const hasSelectedFilters = getDifferenceFilters(parameters.filters)
  const hasNoResultWithFilter = !hasProposals && hasSelectedFilters
  const stepDisplay = React.useMemo(
    () => getStepDisplay(project, parameters.filters.step),
    [project, parameters.filters.step],
  )
  const { bgColor } = useSelector((state: State) => ({
    bgColor: state.default.parameters['color.btn.primary.bg'],
  }))
  const steps = getFormattedStepsChoicesForProject(project)
  const selectedStepId: ProposalsStepValues = parameters.filters.step
  const selectedStep: StepFilter | null | undefined = steps.find(({ id }) => id === selectedStepId)
  const proposalFormId: string = selectedStep?.form.id || ''
  const proposals =
    project.proposals.edges
      ?.map(edge => edge && edge.node)
      ?.filter(Boolean)
      .map(
        ({
          id,
          fullReference,
          title,
          paperVotesTotalCount,
          paperVotesTotalPointsCount,
          canContactAuthor,
          nbrOfMessagesSentToAuthor,
        }) => ({
          id,
          fullReference,
          title,
          paperVotesTotalCount,
          paperVotesTotalPointsCount,
          canContactAuthor,
          nbrOfMessagesSentToAuthor,
        }),
      ) ?? []
  const areOpinions = selectedStep?.form?.objectType === 'OPINION'
  const [proposalSelected, setProposalSelected] = React.useState<string | null | undefined>(null)
  const [proposalModalDelete, setProposalModalDelete] = React.useState<AnalysisProposal_proposal | null | undefined>(
    null,
  )
  const [loading, setLoading] = React.useState<boolean>(false)
  const [showPaperVotesModal, setShowPaperVotesModal] = useState<boolean>(false)
  const loadMore = React.useCallback(() => {
    if (!relay.hasMore() || relay.isLoading()) {
      return
    }

    relay.loadMore(PROJECT_ADMIN_PROPOSAL_LOAD_100, () => {
      loadMore()
    })
  }, [relay])
  const loadAll = React.useCallback(() => {
    if (!loading && project.proposals.totalCount) {
      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'loading-success',
        }),
        position: 'bottom',
      })
      setLoading(true)
    }

    loadMore()
  }, [intl, loadMore, project, loading])
  const { isToasting } = useToastingMachine()
  React.useEffect(() => {
    if (!loading && (!relay.hasMore() || !relay.isLoading()) && !isToasting) {
      clearToasts()
    }

    loadAll()
  }, [loadAll, loading, relay, isToasting])
  const isInteractive =
    parameters.filters.state !== 'ALL' && !STATE_RESTRICTED.includes(parameters.filters.state) && !hasNoResultWithFilter
  return (
    <PickableList.Provider>
      <AnalysisPickableListContainer>
        {hasContributionsStep && baseUrl && (
          <Button
            variant="tertiary"
            onClick={() => history.push(baseUrl)}
            leftIcon={CapUIIcon.LongArrowLeft}
            size="small"
            mb={4}
          >
            {intl.formatMessage({
              id: 'global.steps',
            })}
          </Button>
        )}
        <Flex justify="space-between">
          <div>
            <ClearableInput
              id="search"
              name="search"
              type="text"
              icon={<i className="cap cap-magnifier" />}
              disabled={!hasProposals}
              onClear={() => {
                if (parameters.filters.term !== null) {
                  dispatch({
                    type: 'CLEAR_TERM',
                  })
                }
              }}
              initialValue={parameters.filters.term}
              onSubmit={term => {
                if (term === '' && parameters.filters.term !== null) {
                  dispatch({
                    type: 'CLEAR_TERM',
                  })
                } else if (term !== '' && parameters.filters.term !== term) {
                  dispatch({
                    type: 'SEARCH_TERM',
                    payload: term,
                  })
                }
              }}
              placeholder={intl.formatMessage({
                id: 'global.menu.search',
              })}
            />
          </div>
          <ButtonGroup>
            {selectedStepId && selectedStep?.type === 'CollectStep' && selectedStep?.form?.id && (
              <ImportButton
                proposals={proposals}
                selectedStep={selectedStep}
                proposalFormId={proposalFormId}
                projectId={project.id}
                projectTitle={project.title}
                viewerIsAdmin={viewerIsAdmin}
              />
            )}
            {selectedStepId &&
              selectedStep?.type === 'SelectionStep' &&
              selectedStep?.form?.id &&
              paperVotesEnabled &&
              selectedStep.votable && (
                <>
                  <Button
                    variant="tertiary"
                    onClick={() => window.open(`/admin-next/paper-catalog/${selectedStep.id}`, '_blank')}
                    leftIcon={CapUIIcon.Print}
                  >
                    {intl.formatMessage({
                      id: 'print-catalog',
                    })}
                  </Button>
                  <Button
                    variantSize="small"
                    variant="secondary"
                    onClick={() => {
                      setShowPaperVotesModal(true)
                    }}
                  >
                    {intl.formatMessage({
                      id: 'paper-votes-add',
                    })}
                  </Button>
                  <ImportPaperVotesFromCsvModal
                    show={showPaperVotesModal}
                    selectedStepId={selectedStep.id}
                    selectedStepTitle={selectedStep.title}
                    projectTitle={project.title}
                    isVoteRanking={selectedStep.votesRanking}
                    proposals={proposals}
                    onClose={() => {
                      setShowPaperVotesModal(false)
                    }}
                  />
                </>
              )}
            {viewerIsAdmin && project.exportableSteps && (
              <NewExportButton
                disabled={!hasProposals}
                onChange={(stepSlug: string | string[]) => {
                  if (typeof stepSlug === 'string') {
                    window.open(`/projects/${project.slug}/step/${stepSlug ?? ''}/download`, '_blank')
                  }
                }}
                exportableSteps={project.exportableSteps}
                linkHelp="https://aide.cap-collectif.com/article/67-exporter-les-contributions-dun-projet-participatif"
              />
            )}
          </ButtonGroup>
        </Flex>

        <S.ProjectAdminProposalsHeader>
          <div>
            <InlineSelect
              value={parameters.filters.state}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_STATE_FILTER',
                  payload: newValue as any as ProposalsStateValues,
                })
              }}
            >
              <InlineSelect.Choice value="ALL">
                {intl.formatMessage(
                  {
                    id: areOpinions ? 'filter.count.status.all.masculine' : 'filter.count.status.all',
                  },
                  {
                    num: project.proposalsAll?.totalCount,
                  },
                )}
              </InlineSelect.Choice>
              <InlineSelect.Choice value="PUBLISHED">
                {intl.formatMessage(
                  {
                    id: areOpinions ? 'filter.count.status.published-masculine' : 'filter.count.status.published',
                  },
                  {
                    num: project.proposalsPublished?.totalCount,
                  },
                )}
              </InlineSelect.Choice>
              <InlineSelect.Choice value="DRAFT">
                {intl.formatMessage(
                  {
                    id: 'filter.count.status.draft',
                  },
                  {
                    num: project.proposalsDraft?.totalCount,
                  },
                )}
              </InlineSelect.Choice>
              <InlineSelect.Choice value="TRASHED">
                {intl.formatMessage(
                  {
                    id: 'filter.count.status.trash',
                  },
                  {
                    num: project.proposalsTrashed?.totalCount,
                  },
                )}
              </InlineSelect.Choice>
              <InlineSelect.Choice value="ARCHIVED">
                {intl.formatMessage(
                  {
                    id: 'filter.count.status.archived',
                  },
                  {
                    num: project.proposalsArchived?.totalCount,
                  },
                )}
              </InlineSelect.Choice>
            </InlineSelect>
          </div>
        </S.ProjectAdminProposalsHeader>

        <PickableList>
          <AnalysisProposalListHeaderContainer
            isSelectable={isInteractive}
            disabled={!hasProposals && !hasSelectedFilters}
          >
            <ProposalListHeader project={project} themes={themes} />
          </AnalysisProposalListHeaderContainer>

          <PickableList.Body>
            {hasProposals ? (
              project.proposals?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(proposal => {
                  const color = proposal.status?.color ? colorsData[proposal.status?.color] : ''
                  return (
                    <AnalysisProposal
                      isAdminView
                      hasRegroupTag
                      proposal={proposal}
                      isVoteRanking={selectedStep?.votesRanking || false}
                      isVotable={selectedStep?.votable || false}
                      votes={proposal.proposalVotes.totalCount}
                      paperVotes={proposal.paperVotesTotalCount}
                      points={proposal.proposalVotes.totalPointsCount}
                      paperPoints={proposal.paperVotesTotalPointsCount}
                      rowId={proposal.id}
                      key={proposal.id}
                      dispatch={dispatch}
                      hasStateTag={parameters.filters.state === 'ALL'}
                      setProposalModalDelete={setProposalModalDelete}
                      proposalSelected={proposalSelected || null}
                      setProposalSelected={setProposalSelected}
                      hasThemeEnabled={selectedStep?.hasTheme || false}
                      canContactAuthor={proposal.canContactAuthor}
                      nbrOfMessagesSentToAuthor={proposal.nbrOfMessagesSentToAuthor}
                    >
                      <S.ProposalListRowInformationsStepState>
                        {stepDisplay && <S.ProposalVotableStep>{stepDisplay.title}</S.ProposalVotableStep>}

                        <S.Label
                          css={{
                            background: `${color || bgColor} !important`,
                          }}
                          onClick={() =>
                            dispatch({
                              type: 'CHANGE_STATUS_FILTER',
                              payload: proposal.status?.id as any as ProposalsStatusValues,
                            })
                          }
                        >
                          {proposal.status?.name ||
                            intl.formatMessage({
                              id: 'admin.fields.proposal.no_status',
                            })}
                        </S.Label>
                      </S.ProposalListRowInformationsStepState>
                    </AnalysisProposal>
                  )
                })
            ) : (
              <AnalysisNoProposal state={hasSelectedFilters ? 'CONTRIBUTION' : parameters.filters.state}>
                <FormattedMessage id={getWordingEmpty(hasSelectedFilters, parameters.filters)} tagName="p" />
              </AnalysisNoProposal>
            )}
          </PickableList.Body>
        </PickableList>

        {!!proposalModalDelete && (
          <ModalDeleteProposal
            proposal={proposalModalDelete}
            parentConnectionId={project.id}
            show={!!proposalModalDelete}
            onClose={() => setProposalModalDelete(null)}
            parametersConnection={parameters}
          />
        )}
      </AnalysisPickableListContainer>
    </PickableList.Provider>
  )
}

const mapStateToProps = (state: State) => ({
  viewerIsAdmin: state.user.user ? state.user.user.isAdmin : false,
})

const container = createPaginationContainer(
  ProjectAdminProposals,
  {
    project: graphql`
      fragment ProjectAdminProposals_project on Project
      @argumentDefinitions(
        viewerIsAdmin: { type: "Boolean!" }
        count: { type: "Int!" }
        proposalRevisionsEnabled: { type: "Boolean!" }
        cursor: { type: "String" }
        orderBy: { type: "[ProposalOrder!]", defaultValue: [{ field: PUBLISHED_AT, direction: DESC }] }
        state: { type: "ProposalsState!", defaultValue: ALL }
        category: { type: "ID", defaultValue: null }
        district: { type: "ID", defaultValue: null }
        theme: { type: "ID", defaultValue: null }
        status: { type: "ID", defaultValue: null }
        step: { type: "ID", defaultValue: null }
        term: { type: "String", defaultValue: null }
      ) {
        id
        title
        adminAlphaUrl
        slug
        type {
          title
        }
        exportableSteps @include(if: $viewerIsAdmin) {
          position
          step {
            id
            __typename
            title
            slug
          }
        }
        steps {
          __typename
          id
          title
          label
          # ProposalStep could be used here for CollectStep & SelectionStep
          # but relay-hooks doesn't retrieve this in store when preloading
          ... on CollectStep {
            votable
            votesRanking
            statuses {
              id
              name
              color
            }
            form {
              id
              usingThemes
              districts {
                id
                name
              }
              categories {
                id
                name
              }
              canContact
              objectType
            }
          }
          ... on SelectionStep {
            votable
            votesRanking
            statuses {
              id
              name
              color
            }
            form {
              id
              usingThemes
              districts {
                id
                name
              }
              categories {
                id
                name
              }
              canContact
            }
          }
        }
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          state: $state
          category: $category
          district: $district
          theme: $theme
          status: $status
          step: $step
          term: $term
        )
          @connection(
            key: "ProjectAdminProposals_proposals"
            filters: ["orderBy", "state", "category", "district", "theme", "status", "step", "term"]
          ) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              title
              hasBeenMerged
              author {
                id
                username
              }
              adminUrl
              publishedAt
              draft
              trashed
              district {
                id
                name
              }
              category {
                id
                name
              }
              reference(full: false)
              fullReference: reference(full: true)
              status(step: $step) {
                id
                name
                color
              }
              proposalVotes: votes(stepId: $step) {
                totalCount
                totalPointsCount
              }
              form {
                step {
                  id
                  title
                }
              }
              selections {
                step {
                  id
                  title
                }
              }
              paperVotesTotalCount(stepId: $step)
              paperVotesTotalPointsCount(stepId: $step)
              canContactAuthor
              nbrOfMessagesSentToAuthor
              ...AnalysisProposal_proposal
                @arguments(isAdminView: true, proposalRevisionsEnabled: $proposalRevisionsEnabled, step: $step)
            }
            cursor
          }
        }
        proposalsAll: proposals(state: ALL) {
          totalCount
        }
        proposalsPublished: proposals(state: PUBLISHED) {
          totalCount
        }
        proposalsDraft: proposals(state: DRAFT) {
          totalCount
        }
        proposalsTrashed: proposals(state: TRASHED) {
          totalCount
        }
        proposalsArchived: proposals(state: ARCHIVED) {
          totalCount
        }
      }
    `,
    themes: graphql`
      fragment ProjectAdminProposals_themes on Theme @relay(plural: true) {
        id
        title
      }
    `,
  },
  {
    direction: 'forward',

    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * @ts-expect-error
     * */
    getConnectionFromProps(props: Props) {
      return props.project && props.project.proposals
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor }
    },

    query: graphql`
      query ProjectAdminProposalsPaginatedQuery(
        $projectId: ID!
        $viewerIsAdmin: Boolean!
        $count: Int!
        $proposalRevisionsEnabled: Boolean!
        $cursor: String
        $orderBy: [ProposalOrder!]
        $state: ProposalsState!
        $category: ID
        $district: ID
        $theme: ID
        $status: ID
        $step: ID
        $term: String
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminProposals_project
            @arguments(
              viewerIsAdmin: $viewerIsAdmin
              count: $count
              proposalRevisionsEnabled: $proposalRevisionsEnabled
              cursor: $cursor
              orderBy: $orderBy
              state: $state
              category: $category
              district: $district
              theme: $theme
              status: $status
              step: $step
              term: $term
            )
        }
      }
    `,
  },
)
export default connect(mapStateToProps)(container)
