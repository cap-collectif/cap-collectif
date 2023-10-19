// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { ICON_NAME } from '~ui/Icons/Icon'
import ParticipationTutorial from '~/components/InteClient/ParticipationTutorial/ParticipationTutorial'

const inputs = [
  {
    mainText: 'Votant pour, contre, mitigé sur les propositions initiales',
    secondText: 'du député ou sur les propositions des participants',
    icon: {
      primaryColor: '#08A07C',
      secondaryColor: '#CEF3EA',
      iconName: ICON_NAME.thumbO,
    },
  },
  {
    mainText: 'Votant pour, contre, mitigé sur les propositions initiales',
    secondText: 'du député ou sur les propositions des participants',
    icon: {
      primaryColor: '#30A6E8',
      secondaryColor: '#CDE6F4',
      iconName: ICON_NAME.micO,
    },
  },
  {
    mainText: 'Votant pour, contre, mitigé sur les propositions initiales',
    secondText: 'du député ou sur les propositions des participants',
    icon: {
      primaryColor: '#7AA008',
      secondaryColor: '#EAF4CD',
      iconName: ICON_NAME.padO,
    },
  },
]
storiesOf('Inté client/ParticipationTutorial', module).add(
  'Default',
  () => <ParticipationTutorial instructions={inputs} />,
  {
    knobsToBo: {
      componentName: 'ParticipationTutorialApp',
    },
  },
)
