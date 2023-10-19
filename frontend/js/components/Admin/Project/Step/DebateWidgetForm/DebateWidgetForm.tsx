import * as React from 'react'
import { connect } from 'react-redux'
import { Field, formValueSelector } from 'redux-form'
import { FormattedMessage, useIntl } from 'react-intl'
import Flex from '~ui/Primitives/Layout/Flex'
import Text from '~ui/Primitives/Text'
import renderComponent from '~/components/Form/Field'
import { FontWeight } from '~ui/Primitives/constants'
import type { GlobalState } from '~/types'
import Tooltip from '~ds/Tooltip/Tooltip'
import Icon from '~ds/Icon/Icon'
import Button from '~ds/Button/Button'
import AppBox from '~ui/Primitives/AppBox'
import CopyLinkButton from '~ui/Link/CopyLinkButton'
import { baseUrl } from '~/config'
const stepFormName = 'stepForm'
type Widget = {
  readonly background: string
  readonly border: string
  readonly width: string
  readonly height: string
  readonly destination: string | null | undefined
}
type Props = {
  readonly debateId: string
  readonly widget: Widget
}

const getIframeCode = (debateId: string, widget: Widget): string => {
  const backgroundCleaned = widget.background.replace('#', '')
  const parametersQuery = `?background=${backgroundCleaned}${
    widget.destination ? `&destination=${widget.destination}` : ''
  }`
  const sourceUrl = `${baseUrl}/widget_debate/${debateId}`
  const source = `${sourceUrl}${parametersQuery}`
  const style = `border: 1px solid ${widget.border}; height: ${widget.height}`
  return `<iframe src="${source}" width="${widget.width}" style="${style}"></iframe>`
}

export const DebateWidgetForm = ({ debateId, widget }: Props): JSX.Element => {
  const intl = useIntl()
  const widgetCode = getIframeCode(debateId, widget)
  return (
    <Flex direction="column">
      <Text mb={4}>
        {intl.formatMessage({
          id: 'help-widget-integration',
        })}
      </Text>

      <Flex direction="column" spacing={2}>
        <Text>
          <Text as="span">
            {intl.formatMessage({
              id: 'widget-appearance',
            })}
          </Text>
          <Text as="span" color="gray.500">
            {intl.formatMessage({
              id: 'global.optional',
            })}
          </Text>
        </Text>

        <Flex direction="row" spacing={2}>
          <Field
            type="color-picker"
            name="widget.background"
            label={
              <Text fontWeight={FontWeight.Normal}>
                <FormattedMessage id="background" />
              </Text>
            }
            component={renderComponent}
          />

          <Field
            type="color-picker"
            name="widget.border"
            label={
              <Text fontWeight={FontWeight.Normal}>
                <FormattedMessage id="border" />
              </Text>
            }
            component={renderComponent}
          />

          <Field
            type="text"
            name="widget.width"
            label={
              <Text fontWeight={FontWeight.Normal}>
                <FormattedMessage id="global.width" />
              </Text>
            }
            component={renderComponent}
          />

          <Field
            type="text"
            name="widget.height"
            label={
              <Text fontWeight={FontWeight.Normal}>
                <FormattedMessage id="global.height" />
              </Text>
            }
            component={renderComponent}
          />
        </Flex>

        <Field
          type="text"
          name="widget.destination"
          label={
            <Flex direction="row">
              <Text fontWeight={FontWeight.Normal}>
                <Text as="span">
                  {intl.formatMessage({
                    id: 'destination-link',
                  })}
                </Text>
                <Text as="span" color="gray.500">
                  {intl.formatMessage({
                    id: 'global.optional',
                  })}
                </Text>
              </Text>
              <Tooltip
                label={intl.formatMessage({
                  id: 'allow-display-contributions-sources',
                })}
              >
                <AppBox>
                  <Icon name="CIRCLE_INFO" size="md" color="blue.500" />
                </AppBox>
              </Tooltip>
            </Flex>
          }
          placeholder="paste-widget-destination-link"
          component={renderComponent}
        />
      </Flex>

      <Flex direction="column" spacing={2}>
        <Flex direction="row" spacing={1}>
          <Text bg="white" color="gray.900">
            <FormattedMessage id="integration-code" />
          </Text>

          <Tooltip
            label={intl.formatMessage({
              id: 'copy-paste-in-html-page',
            })}
          >
            <AppBox>
              <Icon name="CIRCLE_INFO" size="md" color="blue.500" />
            </AppBox>
          </Tooltip>
        </Flex>

        <AppBox
          position="relative"
          border="normal"
          borderColor="gray.300"
          px={3}
          py={1}
          pb={6}
          borderRadius="normal"
          bg="white"
        >
          <Text color="gray.900">{widgetCode}</Text>
          <CopyLinkButton value={widgetCode}>
            {isCopied => (
              <Button
                variant="tertiary"
                variantColor={isCopied ? 'hierarchy' : 'primary'}
                rightIcon={isCopied ? 'CHECK_O' : undefined}
                disabled={isCopied}
                position="absolute"
                bottom="0"
                left={3}
              >
                <FormattedMessage id={isCopied ? 'global.copied' : 'global.copy'} />
              </Button>
            )}
          </CopyLinkButton>
        </AppBox>
      </Flex>
    </Flex>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  widget: {
    background: formValueSelector(stepFormName)(state, 'widget.background'),
    border: formValueSelector(stepFormName)(state, 'widget.border'),
    width: formValueSelector(stepFormName)(state, 'widget.width'),
    height: formValueSelector(stepFormName)(state, 'widget.height'),
    destination: formValueSelector(stepFormName)(state, 'widget.destination'),
  },
})

const DebateWidgetFormConnected = connect<any, any>(mapStateToProps)(DebateWidgetForm)
export default DebateWidgetFormConnected
