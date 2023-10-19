import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Flex, Menu } from '@cap-collectif/ui'
import SocialIcon from '../Icons/SocialIcon'

type Props = {
  action: 'facebook' | 'twitter' | 'linkedin' | 'mail' | 'link'
  onSelect?: () => void
}

class ShareButtonAction extends React.Component<Props> {
  render() {
    const { action, onSelect } = this.props
    return (
      <Menu.Item
        _hover={{
          color: 'initial',
          textDecoration: 'none',
        }}
        as="a"
        href="#"
        className="share-option"
        onClick={(e: React.SyntheticEvent<HTMLAnchorElement>) => {
          e.preventDefault()

          if (onSelect) {
            onSelect()
          }
        }}
        name={`share.${action}`}
        style={{
          marginBottom: 'unset',
          lineHeight: 'inherit',
          background: 'transparent',
          borderColor: 'transparent',
        }}
      >
        <Flex spacing={1}>
          <SocialIcon name={action} size={16} />
          <FormattedMessage id={`share.${action}`} />
        </Flex>
      </Menu.Item>
    )
  }
}

export default ShareButtonAction
