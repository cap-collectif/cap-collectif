import * as React from 'react'
import { useIntl } from 'react-intl'

import styled from 'styled-components'
import Icon, { ICON_NAME as OLD_ICON } from '~ui/Icons/Icon'
import colors from '~/utils/colors'
import { ButtonInformation } from './ExportButton.style'
import Flex from '~ui/Primitives/Layout/Flex'
import Menu from '~ds/Menu/Menu'
import Button from '~ds/Button/Button'
import { ICON_NAME } from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
type Props = {
  onChange: (newValue: string | string[]) => void
  linkHelp: string
  disabled?: boolean
  exportableSteps: ReadonlyArray<
    | {
        readonly position: number | null | undefined
        readonly step: {
          readonly id: string
          readonly __typename: string
          readonly title: string
          readonly slug: string | null | undefined
        }
      }
    | null
    | undefined
  >
}
const CustomOptionItem = styled(Menu.OptionItem)`
  input {
    display: none;
  }
`

const NewExportButton = ({ onChange, linkHelp, exportableSteps, disabled }: Props) => {
  const intl = useIntl()
  return (
    <Menu placement="bottom-start">
      <Menu.Button>
        <Button disabled={disabled} rightIcon={ICON_NAME.ARROW_DOWN_O} variantSize="small" variant="primary">
          {intl.formatMessage({
            id: 'global.export',
          })}
        </Button>
      </Menu.Button>
      <Menu.List mt={0} maxWidth={300}>
        <Menu.OptionGroup
          onChange={onChange}
          type="radio"
          uppercase={false}
          titleBackgroundColor={colors.paleGrey}
          title={
            <Flex direction="row" justify="space-between">
              {intl.formatMessage({
                id: 'pop.over.label.export.data-set',
              })}
              <ButtonInformation target="_blank" rel="noopener noreferrer" href={linkHelp}>
                <Icon
                  name={OLD_ICON.information}
                  size={16}
                  color={colors.iconGrayColor}
                  title={intl.formatMessage({
                    id: 'label.export.by.step',
                  })}
                />
              </ButtonInformation>
            </Flex>
          }
        >
          {exportableSteps.filter(Boolean).map(({ position, step }) => (
            <CustomOptionItem key={step.id} value={step.slug} fontSize={12} className="excerpt">
              <Text>
                <strong className="bold-content">
                  {intl.formatMessage({
                    id: 'admin.label.step',
                  })}
                  {` ${position ?? 0} ${step.title}`}
                </strong>
                {` - `}
                {intl.formatMessage({
                  id: step.__typename === 'QuestionnaireStep' ? 'list-of-answers' : 'list-of-contributions',
                })}
              </Text>
            </CustomOptionItem>
          ))}
        </Menu.OptionGroup>
      </Menu.List>
    </Menu>
  )
}

export default NewExportButton
