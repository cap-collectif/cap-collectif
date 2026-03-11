import * as React from 'react'
import { Box, CapUIFontWeight, CapUIIcon, CapUIIconSize, Flex, Icon, Radio, RadioGroup, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

const btnIcons = [
  CapUIIcon.ThumbUp,
  CapUIIcon.HandVoting,
  CapUIIcon.BallotBox,
  CapUIIcon.MenuArrowUp,
  CapUIIcon.ShoppingBasketHeart,
  CapUIIcon.MoneyBag,
  CapUIIcon.MoneyPiggy,
  CapUIIcon.HandHoldingHeart,
  CapUIIcon.Heart,
  CapUIIcon.RatingStar,
]
const btnActions = ['vote', 'support']

export interface ProposalStepVoteBtnProps {}

const ProposalStepVoteBtn: React.FC<ProposalStepVoteBtnProps> = () => {
  const intl = useIntl()
  const { watch, setValue } = useFormContext()

  const selectedIcon = watch('voteBtnIcon', CapUIIcon.ThumbUp)
  const selectedAction = watch('voteBtnAction', 'vote')

  return (
    <Box>
      <Box mt={'xl'}>
        <Text fontWeight={CapUIFontWeight.Semibold}>{intl.formatMessage({ id: 'step.vote.btn.icon.title' })}</Text>
        <Text>{intl.formatMessage({ id: 'step.vote.btn.icon.desc' })}</Text>
        <Flex mt={'md'} gap={'sm'}>
          {btnIcons.map((icon, index) => (
            <Box
              key={`btn-icons-${index}`}
              backgroundColor={icon === selectedIcon ? 'primary.lighter' : 'transparent'}
              borderWidth={1}
              borderColor={icon === selectedIcon ? 'primary.light' : 'transparent'}
              borderRadius={'xs'}
              p={'xs'}
              sx={{ cursor: 'pointer' }}
              onClick={() => setValue('voteBtnIcon', icon)}
            >
              <Icon
                name={icon}
                size={CapUIIconSize.Lg}
                color={icon === selectedIcon ? 'primary.base' : 'text.tertiary'}
              />
            </Box>
          ))}
        </Flex>
      </Box>
      <Box mt={'xl'}>
        <Text fontWeight={CapUIFontWeight.Semibold}>{intl.formatMessage({ id: 'step.vote.btn.action.title' })}</Text>
        <Text>{intl.formatMessage({ id: 'step.vote.btn.action.desc' })}</Text>
        <Box mt={'sm'}>
          <RadioGroup>
            {btnActions.map((action, index) => (
              <Radio
                key={`btn-action-${index}`}
                id={`btn-action-${action}`}
                name={`btn-action`}
                value={action}
                defaultChecked={action === selectedAction}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('voteBtnAction', e.target.value)}
              >
                {intl.formatMessage({ id: `step.vote.btn.action.${action}` })}
              </Radio>
            ))}
          </RadioGroup>
        </Box>
      </Box>
    </Box>
  )
}

export default ProposalStepVoteBtn
