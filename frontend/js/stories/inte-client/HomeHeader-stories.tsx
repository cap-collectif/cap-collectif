// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { text, object } from '@storybook/addon-knobs'
import HomeHeader from '~/components/InteClient/HomeHeader/HomeHeader'

storiesOf('Inté client/HomeHeader', module).add(
  'Default',
  () => {
    const title = text('title', 'Revenu de base :<br/><span style="color:red">co-construisez</span> la loi')
    const description = text(
      'description',
      'Le groupe Socialiste à l’Assemblée Nationale lance une grande consultation sur le revenu de base et la dotation universelle.',
    )
    const tag = object('tag', {
      icon: 'clock-o',
      text: 'Consultation en cours',
      colors: {
        text: '#D0111D',
        background: '#F9E7E8',
      },
      mobileColors: {
        text: '#fff',
        background: '#D0111D',
      },
    })
    const mainLink = object('mainLink', {
      link: 'http://www.donothingfor2minutes.com/',
      text: 'Je participe',
      colors: {
        text: '#fff',
        background: '#4211D0',
      },
    })
    const secondLink = object('secondLink', {
      link: 'http://www.donothingfor2minutes.com/',
      text: 'Voir les consultations',
      textColor: '#4211D0',
    })
    const mainImg = text('img', 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png')
    return (
      <div
        style={{
          width: 1444,
          height: 600,
          padding: '30px 30px',
          border: '1px solid red',
        }}
      >
        <HomeHeader
          title={title}
          description={description}
          img={mainImg}
          tag={tag}
          mainLink={mainLink}
          secondLink={secondLink}
        />
      </div>
    )
  },
  {
    knobsToBo: {
      componentName: 'HomeHeaderApp',
    },
  },
)
