import { Button, CapUIIcon, Menu } from '@cap-collectif/ui'
import { CarrouselElementType } from '@relay/SectionIdCarrouselQuery.graphql'
import { dangerToast } from '@shared/utils/toasts'
import { FC } from 'react'
import { UseFieldArrayPrepend } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues, SectionType } from './Carrousel.utils'

export const CarrouselAddItemButton: FC<{
  prepend: UseFieldArrayPrepend<FormValues, 'carrouselElements'>
  cannotAddMoreFields?: boolean
  type: SectionType
}> = ({ prepend, cannotAddMoreFields, type }) => {
  const intl = useIntl()

  const onClick = (type: CarrouselElementType) => {
    if (cannotAddMoreFields)
      dangerToast(
        intl.formatMessage({ id: 'section.max_elem' }) + '<br />' + intl.formatMessage({ id: 'section.please_delete' }),
      )
    else
      prepend({
        type,
        title: '',
        description: '',
        buttonLabel: intl.formatMessage({ id: 'learn.more' }),
        redirectLink: '',
        image: null,
        isDisplayed: false,
      })
  }

  return (
    <Menu
      placement="bottom-start"
      disclosure={
        <Button
          variantColor="primary"
          variant="primary"
          variantSize="small"
          rightIcon={CapUIIcon.ArrowDown}
          id="add-question-btn"
        >
          {intl.formatMessage({ id: 'section.carousel_add' })}
        </Button>
      }
    >
      <Menu.List>
        {type === 'carrousel' ? (
          <Menu.Item onClick={() => onClick('CUSTOM')}>{intl.formatMessage({ id: 'customized' })}</Menu.Item>
        ) : null}
        <Menu.Item onClick={() => onClick('ARTICLE')}>
          {intl.formatMessage({ id: 'admin.fields.theme.posts' })}
        </Menu.Item>
        <Menu.Item onClick={() => onClick('EVENT')}>{intl.formatMessage({ id: 'global.events' })}</Menu.Item>
        <Menu.Item onClick={() => onClick('PROJECT')}>
          {intl.formatMessage({ id: 'global.participative.project' })}
        </Menu.Item>
        <Menu.Item onClick={() => onClick('THEME')}>
          {intl.formatMessage({ id: 'admin.fields.project.themes' })}
        </Menu.Item>
      </Menu.List>
    </Menu>
  )
}
