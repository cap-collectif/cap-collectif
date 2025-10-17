import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Flex,
  FormLabel,
  Text,
  UPLOADER_SIZE,
  Button,
  Tabs,
  Heading,
  Switch,
  Accordion,
  CapUIAccordionColor,
  CapUIFontSize,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { UPLOAD_PATH } from '@utils/config'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { UserListField } from '@components/BackOffice/Form/UserListField'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import SubmitButtons from '@components/BackOffice/Form/SubmitButtons'
import DurationInput from '@components/BackOffice/Form/DurationInput'
import { EventModalConfirmationDelete } from './EventModalConfirmationDelete'
import { DisabledParams, EventFormValues, isFieldDisabled, RegistrationType } from './utils'

type EventFormProps = {
  eventId?: string
  defaultLocale: string
  disabledParams: DisabledParams
}

const EventForm: React.FC<EventFormProps> = ({ eventId, defaultLocale = 'FR_FR', disabledParams }: EventFormProps) => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext<EventFormValues>()
  const { viewerSession } = useAppContext()
  const { isAdmin, isSuperAdmin } = viewerSession
  const hasAdminRights = isAdmin || isSuperAdmin
  const registrationType = watch('registrationType')
  const currentLocale = watch('currentLocale')
  const isMeasurable = watch('isMeasurable')
  const title = watch(`${currentLocale}-title`)
  const isDisabled = isFieldDisabled(disabledParams)
  const isDisabledExceptForAdmin = isFieldDisabled(disabledParams, true)

  return (
    <Flex
      direction="column"
      marginTop="48px"
      spacing={6}
      bg="white"
      borderRadius="accordion"
      p={6}
      justify="space-between"
    >
      <Flex direction="row" alignItems="flex-start" spacing={6} justify="space-between">
        <Flex direction="column" width="70%">
          <FormControl name={`${currentLocale}-title`} control={control} key={`${currentLocale}-title`} isRequired>
            <FormLabel htmlFor={`${currentLocale}-title`} label={intl.formatMessage({ id: 'global.title' })} />
            <FieldInput
              type="text"
              name={`${currentLocale}-title`}
              id={`${currentLocale}-title`}
              control={control}
              required
              disabled={isDisabled}
            />
          </FormControl>

          <FormControl name="author" control={control} isRequired>
            <FormLabel htmlFor="author" label={intl.formatMessage({ id: 'global.author' })} />
            <UserListField
              clearable={false}
              control={control}
              // @ts-ignore
              autoload
              name="author"
              id="author"
              disabled={!hasAdminRights || isDisabled}
              debounce
              aria-autocomplete="list"
              aria-haspopup="true"
              role="combobox"
              selectFieldIsObject
            />
          </FormControl>

          <FormControl name="addressText" control={control}>
            <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500" lineHeight={1}>
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FieldInput
              name="addressText"
              type={isDisabled ? 'text' : 'address'}
              disabled={isDisabled}
              placeholder={intl.formatMessage({ id: 'vote.step.search' })}
              control={control}
              getAddress={add => {
                setValue('address', add ? JSON.stringify([add]) : null)
              }}
            />
          </FormControl>
        </Flex>

        <Flex width="30%">
          <FormControl name="media" control={control} width="100%" mt={-1} spacing={0}>
            <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'cover-image' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>

            <FieldInput
              type="uploader"
              name="media"
              id="media"
              control={control}
              format=".jpg,.jpeg,.png"
              maxSize={8000000}
              minResolution={{
                width: 120,
                height: 80,
              }}
              size={UPLOADER_SIZE.SM}
              uploadURI={UPLOAD_PATH}
              showThumbnail
              isFullWidth
            />
          </FormControl>
        </Flex>
      </Flex>

      <FormControl name={`${currentLocale}-body`} key={`${currentLocale}-body`} control={control} isRequired mb={0}>
        <TextEditor
          label={intl.formatMessage({ id: 'admin.general.content' })}
          name={`${currentLocale}-body`}
          id={`${currentLocale}-body`}
          placeholder={intl.formatMessage({
            id: 'admin.content.start-writing',
          })}
          noModalAdvancedEditor
          platformLanguage={defaultLocale}
          selectedLanguage={defaultLocale}
          required
          mb={0}
          disabled={isDisabled}
        />
      </FormControl>
      <DurationInput disabled={isDisabled} startAt={{ required: true }} />
      <Accordion color={CapUIAccordionColor.Transparent} m={0} mt={-4}>
        <Accordion.Item id="registration">
          <Accordion.Button>{intl.formatMessage({ id: 'global.registration' })}</Accordion.Button>
          <Accordion.Panel>
            <Tabs
              mb={6}
              selectedId={registrationType}
              onChange={selectedTab => {
                if (selectedTab !== registrationType) setValue('registrationType', selectedTab as RegistrationType)
              }}
            >
              <Tabs.ButtonList ariaLabel="voteType">
                <Tabs.Button id="PLATFORM">{intl.formatMessage({ id: 'registration.platform' })}</Tabs.Button>
                <Tabs.Button id="EXTERNAL">{intl.formatMessage({ id: 'registration.external_link' })}</Tabs.Button>
                <Tabs.Button id="DISABLED">{intl.formatMessage({ id: 'action_disable' })}</Tabs.Button>
              </Tabs.ButtonList>
              <Tabs.PanelList>
                <Tabs.Panel>
                  <Flex direction="column" bg="white" borderRadius="normal" p={6}>
                    <Flex justify="space-between" alignItems="flex-start">
                      <Heading as="h5" color="blue.900" fontWeight={600} fontSize={CapUIFontSize.BodyRegular}>
                        {intl.formatMessage({ id: 'measurable-registration' })}
                      </Heading>
                      <Switch
                        id="isMeasurable"
                        disabled={isDisabledExceptForAdmin}
                        checked={isMeasurable}
                        onChange={() => {
                          if (isMeasurable) setValue(`maxRegistrations`, null)
                          setValue(`isMeasurable`, !isMeasurable)
                        }}
                      />
                    </Flex>
                    {isMeasurable ? (
                      <>
                        <Text color="gray.700">{intl.formatMessage({ id: 'max_participants' })}</Text>
                        <FormControl name="maxRegistrations" control={control} position="relative" width="unset" mt={1}>
                          <FieldInput
                            name="maxRegistrations"
                            id="maxRegistrations"
                            control={control}
                            type="number"
                            min={0}
                          />
                        </FormControl>
                      </>
                    ) : null}
                  </Flex>
                </Tabs.Panel>
                <Tabs.Panel>
                  <FormControl name={`${currentLocale}-link`} control={control} variantColor="hierarchy">
                    <FieldInput
                      name={`${currentLocale}-link`}
                      id={`${currentLocale}-link`}
                      control={control}
                      type="text"
                      autoFocus
                      placeholder={intl.formatMessage({ id: 'event.registration.placeholder' })}
                    />
                  </FormControl>
                </Tabs.Panel>
                <Tabs.Panel />
              </Tabs.PanelList>
            </Tabs>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <SubmitButtons
        isCreating={!eventId}
        deleteComponent={
          <EventModalConfirmationDelete
            onDelete={() => setTimeout(() => (window.location.href = '/admin-next/events'), 2000)}
            id={eventId}
            title={title}
            disclosure={
              <Button variant="secondary" variantColor="danger" variantSize="small" id="delete-event">
                {intl.formatMessage({
                  id: 'admin.global.delete',
                })}
              </Button>
            }
          />
        }
        backUrl="events"
      />
    </Flex>
  )
}

export default EventForm
