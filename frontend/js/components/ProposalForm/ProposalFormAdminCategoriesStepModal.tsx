import React, { useState, useEffect } from 'react'
import { Panel } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Field, change, formValueSelector } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import CloseButton from '../Form/CloseButton'
import SubmitButton from '../Form/SubmitButton'
import component from '../Form/Field'
import type { ProposalFormAdminCategoriesStepModal_query$data } from '~relay/ProposalFormAdminCategoriesStepModal_query.graphql'
import type { Dispatch, FeatureToggles, GlobalState } from '~/types'
import ProposalFormCategoryColor from './Category/ProposalFormCategoryColor'
import ProposalFormCategoryIcon from './Category/ProposalFormCategoryIcon'
import ProposalFormCategoryBackgroundPreview from './Category/ProposalFormCategoryBackgroundPreview'
import ProposalFormCategoryPinPreview from './Category/ProposalFormCategoryPinPreview'
import Toggle from '~/components/Ui/Toggle/Toggle'
import Label from '~/components/Ui/Form/Label/Label'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { colors as utilsColors } from '~/utils/colors'
import Flex from '~ui/Primitives/Layout/Flex'
import Tooltip from '~ds/Tooltip/Tooltip'
import Modal from '~ds/Modal/Modal'
import Heading from '~ui/Primitives/Heading'

type RelayProps = {
  query: ProposalFormAdminCategoriesStepModal_query$data
}
export type CategoryImage = {
  id: string
  image:
    | {
        url: string
        id: string
        name: string
      }
    | null
    | undefined
  url?: string
}
type Props = RelayProps & {
  show: boolean
  onClose: () => {}
  onSubmit: () => {}
  member: string
  isUpdating: boolean
  dispatch: Dispatch
  category: {
    categoryImage: CategoryImage | null | undefined
    customCategoryImage: CategoryImage | null | undefined
  }
  name: string | null | undefined
  selectedColor: string | null | undefined
  selectedIcon: string | null | undefined
  customCategoryImage: CategoryImage | null | undefined
  newCategoryImage: CategoryImage | null | undefined
  features: FeatureToggles
  colors: ReadonlyArray<string>
  icons: ReadonlyArray<string>
  usedColors: Array<string | null | undefined>
  usedIcons: Array<string | null | undefined>
}
const formName = 'proposal-form-admin-configuration'
const selector = formValueSelector(formName)
export const ProposalFormAdminCategoriesStepModal = ({
  dispatch,
  member,
  show,
  isUpdating,
  onClose,
  onSubmit,
  query,
  colors,
  icons,
  features,
  category,
  name,
  selectedColor,
  selectedIcon,
  usedColors,
  usedIcons,
  customCategoryImage,
  newCategoryImage,
}: Props) => {
  const [showPredefinedImage, setShowPredefinedImage] = useState<boolean>(!category.customCategoryImage)
  const mergedColors = colors.map(c => ({
    value: c,
    used: usedColors.some(uc => uc === c),
  }))
  const mergedIcons = icons.map(i => ({
    name: i,
    used: usedIcons.some(ic => ic === i),
  }))
  const intl = useIntl()
  useEffect(() => {
    if (!selectedColor) dispatch(change(formName, `${member}.color`, mergedColors.find(c => !c.used)?.value)) // eslint-disable-next-line
  }, [])
  return (
    <Modal
      show={show}
      hideOnClickOutside
      ariaLabel={intl.formatMessage({
        id: !isUpdating ? 'category_modal.create.title' : 'category_modal.update.title',
      })}
      aria-labelledby="report-modal-title-lg"
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading id="report-modal-title-lg">
              <FormattedMessage id={!isUpdating ? 'category_modal.create.title' : 'category_modal.update.title'} />
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <Field
              label={<FormattedMessage id="global.title" />}
              id={`${member}.name`}
              name={`${member}.name`}
              type="text"
              component={component}
              placeholder="category.without.title"
            />
            {features.display_pictures_in_depository_proposals_list && (
              <>
                <Label>
                  <FormattedMessage id="global.color" />
                </Label>
                <Field
                  name={`${member}.color`}
                  selectedColor={selectedColor}
                  categoryColors={mergedColors}
                  onColorClick={(color: string) => dispatch(change(formName, `${member}.color`, color))}
                  component={ProposalFormCategoryColor}
                />
                <Label>
                  <FormattedMessage id="admin.fields.footer_social_network.style" />
                  <span className="excerpt">
                    {' '}
                    <FormattedMessage id="global.optional" />
                  </span>
                </Label>
                <Field
                  name={`${member}.icon`}
                  selectedIcon={selectedIcon}
                  categoryIcons={mergedIcons}
                  selectedColor={selectedColor}
                  onIconClick={(icon: string | null | undefined) => dispatch(change(formName, `${member}.icon`, icon))}
                  component={ProposalFormCategoryIcon}
                />
                <div>
                  <Flex as="label">
                    <FormattedMessage id="global.previsualisation" />
                    <Tooltip
                      placement="top"
                      label={<FormattedMessage id="category.preview" />}
                      id="tooltip-status"
                      className="text-left"
                      style={{
                        wordBreak: 'break-word',
                      }}
                    >
                      <div>
                        <Icon
                          name={ICON_NAME.information}
                          size={12}
                          color={utilsColors.iconGrayColor}
                          className="ml-5"
                        />
                      </div>
                    </Tooltip>
                  </Flex>
                  <div
                    className="d-flex"
                    style={{
                      justifyContent: 'space-between',
                    }}
                  >
                    <ProposalFormCategoryBackgroundPreview
                      color={selectedColor}
                      name={name}
                      icon={selectedIcon}
                      customCategoryImage={!showPredefinedImage ? customCategoryImage || newCategoryImage : null}
                    />
                    {selectedColor && selectedIcon ? (
                      <ProposalFormCategoryPinPreview color={selectedColor} icon={selectedIcon} />
                    ) : null}
                  </div>
                </div>
                <div className="mt-10">
                  <Panel
                    id="proposal_form_category_illustration_panel_body"
                    expanded={!showPredefinedImage}
                    onToggle={() => {}}
                  >
                    <Panel.Heading>
                      <div id="illustration">
                        <div className="pull-left">
                          <Toggle
                            id="toggle-registration"
                            checked={!showPredefinedImage}
                            onChange={() => setShowPredefinedImage(!showPredefinedImage)}
                            label={<FormattedMessage id="custom-illustration" />}
                          />
                        </div>
                        <div className="clearfix" />
                      </div>
                    </Panel.Heading>
                    <Panel.Collapse>
                      <Panel.Body>
                        {!showPredefinedImage && query.customCategoryImages && query.customCategoryImages.length > 0 && (
                          <p className="text-bold">
                            <FormattedMessage id="your-pictures" />
                          </p>
                        )}
                        <Field
                          id={`${member}.customCategoryImage`}
                          name={`${member}.customCategoryImage`}
                          type="radio-images"
                          className={showPredefinedImage ? 'hide' : null}
                          component={component}
                          medias={query.customCategoryImages}
                          disabled={showPredefinedImage}
                          onChange={() => {
                            dispatch(change(formName, `${member}.newCategoryImage`, null))
                          }}
                        />
                        <Field
                          id={`${member}.newCategoryImage`}
                          name={`${member}.newCategoryImage`}
                          component={component}
                          type="image"
                          className={showPredefinedImage ? 'hide' : ''}
                          onChange={() => {
                            dispatch(change(formName, `${member}.customCategoryImage`, null))
                          }}
                          label={
                            <span>
                              <FormattedMessage id="illustration" />
                              <span className="excerpt">
                                {' '}
                                <FormattedMessage id="global.optional" />
                              </span>
                            </span>
                          }
                          help={
                            <span className={showPredefinedImage ? 'hide' : 'excerpt'}>
                              <FormattedMessage id="authorized-files" /> <FormattedMessage id="max-weight-1mo" />
                              <p>
                                <FormattedMessage id="recommanded-dimensions-186x60" />
                              </p>
                            </span>
                          }
                          disabled={showPredefinedImage}
                        />
                      </Panel.Body>
                    </Panel.Collapse>
                  </Panel>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <CloseButton
              onClose={() => {
                onClose()
                setShowPredefinedImage(!isUpdating && !!category.categoryImage)
              }}
            />
            <SubmitButton
              id="ProposalFormAdminCategoriesStepModal-submit"
              label="global.validate"
              isSubmitting={false}
              disabled={!name || !selectedColor}
              onSubmit={() => {
                onSubmit()
                hide()
              }}
            />
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState, { member }: Props) => ({
  features: state.default.features,
  name: selector(state, `${member}.name`),
  selectedColor: selector(state, `${member}.color`),
  selectedIcon: selector(state, `${member}.icon`),
  customCategoryImage: selector(state, `${member}.customCategoryImage`),
  newCategoryImage: selector(state, `${member}.newCategoryImage`),
})

// @ts-ignore
const container = connect(mapStateToProps)(ProposalFormAdminCategoriesStepModal)
export default createFragmentContainer(container, {
  query: graphql`
    fragment ProposalFormAdminCategoriesStepModal_query on Query {
      categoryImages(isDefault: true) {
        id
        image {
          url
          id
          name
        }
      }
      customCategoryImages: categoryImages(isDefault: false) {
        id
        image {
          url
          id
          name
        }
      }
    }
  `,
})
