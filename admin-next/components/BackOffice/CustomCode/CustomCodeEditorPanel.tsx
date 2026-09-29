import { Box, Button, CapUIIcon, Flex, Heading, Tag, Text, Tooltip } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CustomCodeEditor } from './CustomCodeEditor'
import { CurrentVersionCard } from './CurrentVersionCard'
import { CustomCodeItem, Version } from './customCodeVersioning.types'

type CustomCodeEditorPanelProps = {
  currentVersion?: Version
  draftContent: string
  hasUnsavedChanges: boolean
  selectedItem: CustomCodeItem
  onDraftChange: (content: string) => void
  onOpenCommit: () => void
  onOpenDraftDiff: () => void
  onOpenFullscreen: () => void
  onResetDraft: () => void
}

export const CustomCodeEditorPanel: FC<CustomCodeEditorPanelProps> = ({
  currentVersion,
  draftContent,
  hasUnsavedChanges,
  selectedItem,
  onDraftChange,
  onOpenCommit,
  onOpenDraftDiff,
  onOpenFullscreen,
  onResetDraft,
}) => {
  const intl = useIntl()

  return (
    <Box bg="white" borderRadius="8px" p={6}>
      <Flex justify="space-between" align="flex-start" gap={4} mb={5}>
        <Box>
          <Heading as="h4" color="blue.800" fontWeight={600} mb={1}>
            {selectedItem.label}
          </Heading>
          <Text color="gray.700">{selectedItem.description}</Text>
        </Box>
        <Flex gap={2} flexShrink={0}>
          <Tooltip label={intl.formatMessage({ id: 'admin.custom-code.tooltip-fullscreen' })}>
            <Button variant="secondary" variantColor="hierarchy" leftIcon={CapUIIcon.Expand} onClick={onOpenFullscreen}>
              {intl.formatMessage({ id: 'admin.custom-code.fullscreen' })}
            </Button>
          </Tooltip>
          <Tooltip
            label={intl.formatMessage({
              id: hasUnsavedChanges
                ? 'admin.custom-code.tooltip-draft-diff'
                : 'admin.custom-code.tooltip-draft-diff-disabled',
            })}
          >
            <Button variant="secondary" variantColor="primary" disabled={!hasUnsavedChanges} onClick={onOpenDraftDiff}>
              {intl.formatMessage({ id: 'admin.custom-code.view-diff' })}
            </Button>
          </Tooltip>
          <Tooltip
            label={intl.formatMessage({
              id: hasUnsavedChanges ? 'admin.custom-code.tooltip-commit' : 'admin.custom-code.tooltip-commit-disabled',
            })}
          >
            <Button variant="primary" disabled={!hasUnsavedChanges} onClick={onOpenCommit}>
              {intl.formatMessage({ id: 'admin.custom-code.new-commit' })}
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex gap={3} mb={4} wrap="wrap">
        <Tag variantColor={selectedItem.hasCode ? 'success' : 'infoGray'}>
          <Tag.Label>
            {intl.formatMessage({
              id: selectedItem.hasCode ? 'admin.custom-code.active-code' : 'admin.custom-code.no-active-code',
            })}
          </Tag.Label>
        </Tag>
        <Tag variantColor="infoGray">
          <Tag.Label>
            {intl.formatMessage({ id: 'admin.custom-code.lines-count' }, { count: selectedItem.lineCount })}
          </Tag.Label>
        </Tag>
        <Tag variantColor="infoGray">
          <Tag.Label>
            {intl.formatMessage({ id: 'admin.custom-code.characters-count' }, { count: selectedItem.characterCount })}
          </Tag.Label>
        </Tag>
        {hasUnsavedChanges ? (
          <Tag variantColor="warning">
            <Tag.Label>{intl.formatMessage({ id: 'admin.custom-code.unsaved-changes' })}</Tag.Label>
          </Tag>
        ) : null}
      </Flex>

      <CurrentVersionCard currentVersion={currentVersion} />

      <CustomCodeEditor height="420px" value={draftContent} onChange={onDraftChange} />
      <Flex justify="flex-end" mt={3}>
        <Button variant="secondary" variantColor="hierarchy" disabled={!hasUnsavedChanges} onClick={onResetDraft}>
          {intl.formatMessage({ id: 'admin.custom-code.reset-changes' })}
        </Button>
      </Flex>
    </Box>
  )
}
