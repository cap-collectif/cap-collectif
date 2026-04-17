import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Box,
  Button,
  ButtonGroup,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Icon,
  Modal,
  Switch,
  Text,
  toast,
} from '@cap-collectif/ui'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

type Tab = {
  id: string
  title: string
  slug: string
  enabled: boolean
  type: string
  position: number
}

type Props = {
  tab: Tab
  onSaved: (updated: Tab) => Promise<void>
  onDeleted: (tabId: string) => Promise<void>
}

type FormValues = {
  title: string
  enabled: boolean
}

type PopoverPanelProps = {
  anchorRef: React.RefObject<HTMLSpanElement>
  onClose: () => void
  children: React.ReactNode
}

const PopoverPanel = ({ anchorRef, onClose, children }: PopoverPanelProps) => {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({ visibility: 'hidden' })

  React.useLayoutEffect(() => {
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (!anchor || !panel) return

    const compute = () => {
      const rect = anchor.getBoundingClientRect()
      setStyle({
        position: 'absolute',
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
        transform: 'translateX(-50%) translateY(calc(-100% - 8px))',
        zIndex: 1200,
        visibility: 'visible',
      })
    }

    requestAnimationFrame(compute)
  }, [anchorRef])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [anchorRef, onClose])

  return ReactDOM.createPortal(
    <div ref={panelRef} style={{ ...style, position: style.position as any }} onClick={e => e.stopPropagation()}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid white',
          filter: 'drop-shadow(0 1px 0 #e2e8f0)',
        }}
      />
    </div>,
    document.body,
  )
}

const EditTabPopover = ({ tab, onSaved, onDeleted }: Props) => {
  const intl = useIntl()
  const [open, setOpen] = React.useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLSpanElement>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { handleSubmit, control, watch, setValue, reset } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      title: tab.title,
      enabled: tab.enabled,
    },
  })

  React.useEffect(() => {
    reset({ title: tab.title, enabled: tab.enabled })
  }, [tab.id, reset])

  const enabled = watch('enabled')

  const closePopover = React.useCallback(() => {
    setOpen(false)
  }, [])

  const onSubmit = async (formValues: FormValues) => {
    setIsSubmitting(true)
    try {
      await onSaved({ ...tab, title: formValues.title, enabled: formValues.enabled })
      toast({ content: intl.formatMessage({ id: 'global.saved' }), variant: 'success' })
      closePopover()
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      await onDeleted(tab.id)
      closePopover()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Box as="span" ref={anchorRef} onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }}>
        <Icon name={CapUIIcon.Pencil} size={CapUIIconSize.Sm} color="gray.base" />
        {open && (
          <PopoverPanel anchorRef={anchorRef} onClose={closePopover}>
            <Box
              bg="white"
              borderRadius="normal"
              sx={{
                boxShadow: '0 10px 50px 0 rgba(0, 0, 0, 0.15)',
              }}
            >
              <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                <Flex direction="column" gap="md" p="md">
                  <Flex direction="column" gap="md">
                    <FormControl name="title" control={control} isRequired>
                      <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
                      <FieldInput name="title" type="text" control={control} maxLength={60} />
                    </FormControl>
                    <Flex align="center" justify="space-between">
                      <Text>{intl.formatMessage({ id: 'back.project.tab.show' })}</Text>
                      <Switch
                        id={`tab-enabled-${tab.id}`}
                        checked={enabled}
                        onChange={e => setValue('enabled', (e.target as HTMLInputElement).checked)}
                      />
                    </Flex>
                  </Flex>
                  <Flex justify="space-between" gap="md" width="100%">
                    <Button
                      type="button"
                      variant="secondary"
                      variantColor="danger"
                      leftIcon={CapUIIcon.Trash}
                      isLoading={isDeleting}
                      disabled={isSubmitting || isDeleting}
                      onClick={e => {
                        e.stopPropagation()
                        closePopover()
                        setDeleteModalOpen(true)
                      }}
                    >
                      {intl.formatMessage({ id: 'global.delete' })}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      disabled={isSubmitting || isDeleting}
                    >
                      {intl.formatMessage({ id: 'global.save' })}
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </Box>
          </PopoverPanel>
        )}
      </Box>
      <Modal
        ariaLabel={intl.formatMessage({ id: 'global.delete' })}
        size={CapUIModalSize.Sm}
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        {({ hide }: { hide: () => void }) => (
          <>
            <Modal.Header>
              <Text fontSize={CapUIFontSize.Headline} fontWeight={CapUIFontWeight.Semibold}>
                {intl.formatMessage({ id: 'back.project.tab.delete.confirm.title' })}
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Text>{intl.formatMessage({ id: 'back.project.tab.delete.confirm.body' })}</Text>
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button type="button" variant="secondary" variantColor="hierarchy" onClick={hide}>
                  {intl.formatMessage({ id: 'global.cancel' })}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  variantColor="danger"
                  isLoading={isDeleting}
                  onClick={async () => {
                    await onDelete()
                    hide()
                  }}
                >
                  {intl.formatMessage({ id: 'global.delete' })}
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  )
}

export default EditTabPopover
