// @ts-nocheck
import * as React from 'react'
import { useState } from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import Button from '~ds/Button/Button'
import Modal from '~ds/Modal/Modal'
import Text from '~ui/Primitives/Text'
import Heading from '~ui/Primitives/Heading'

export default {
  title: 'Design system/Modal',
  component: Modal,
  argTypes: {
    scrollBehavior: {
      control: {
        type: 'select',
        options: ['inside', 'outside'],
      },
      default: 'inside',
    },
    noBackdrop: {
      control: {
        type: 'boolean',
      },
      default: false,
    },
    preventBodyScroll: {
      control: {
        type: 'boolean',
      },
    },
    hideOnClickOutside: {
      control: {
        type: 'boolean',
      },
      default: true,
    },
    hideOnEsc: {
      control: {
        type: 'boolean',
      },
      default: true,
    },
  },
}

const Template = (args: any) => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Modal
      noBackdrop={args.noBackdrop}
      preventBodyScroll={args.preventBodyScroll}
      scrollBehavior={args.scrollBehavior}
      hideOnEsc={args.hideOnEsc}
      ariaLabel="Genshin Impact"
      disclosure={
        <Button variant="primary" variantSize="medium">
          Open modal
        </Button>
      }
    >
      <Modal.Header>
        <Modal.Header.Label>Manga</Modal.Header.Label>
        <Heading>Genshin impact</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>
          <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par miHoYo
        </Text>
        <Text mt={2}>
          {`Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se sont
            vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de contrôler
            un des sept éléments. Le joueur commence son aventure en tant que Voyageur ou Voyageuse
            dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au cours de
            l'aventure, le joueur a la possibilité de contrôler plusieurs autres personnages qu'il
            rencontre lors de son périple, chacun ayant une personnalité unique et des capacités`}
        </Text>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <Button variantSize="small" variant="primary">
          Hello
        </Button>
        <Button variantSize="small" variant="secondary" color="gray.400">
          Klee
        </Button>
      </Modal.Footer>
    </Modal>
  </Flex>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}
export const withoutBackdrop = Template.bind({})
withoutBackdrop.storyName = 'without backdrop'
withoutBackdrop.args = {
  noBackdrop: true,
}
export const allowBodyScroll = Template.bind({})
allowBodyScroll.storyName = 'allow body scroll'
allowBodyScroll.args = {
  preventBodyScroll: false,
}
export const keepOnClickOutside = Template.bind({})
keepOnClickOutside.storyName = 'keep on click outside'
keepOnClickOutside.args = {
  hideOnClickOutside: false,
}
export const DoNotHideOnEsc = Template.bind({})
DoNotHideOnEsc.storyName = 'do not hide on ESC'
DoNotHideOnEsc.args = {
  hideOnEsc: false,
}

const LongTemplate = (args: any) => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Modal
      noBackdrop={args.noBackdrop}
      preventBodyScroll={args.preventBodyScroll}
      scrollBehavior={args.scrollBehavior}
      hideOnEsc={args.hideOnEsc}
      ariaLabel="Genshin Impact"
      disclosure={
        <Button variant="primary" variantSize="medium">
          Open modal
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>Manga</Modal.Header.Label>
            <Heading>Genshin impact</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par miHoYo
            </Text>
            <Text mt={2}>
              Vous pouvez changer le comportement du scroll grâce à la props <code>scrollBehavior</code>, accessible
              dans les knobs de la story. Bref, revenons en à Genshin Impact.
            </Text>
            <Text mt={2}>
              {`Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se sont
            vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de contrôler
            un des sept éléments. Le joueur commence son aventure en tant que Voyageur ou Voyageuse
            dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au cours de
            l'aventure, le joueur a la possibilité de contrôler plusieurs autres personnages qu'il
            rencontre lors de son périple, chacun ayant une personnalité unique et des capacités`}
            </Text>
            <Text mt={2}>
              {`Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se sont
            vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de contrôler
            un des sept éléments. Le joueur commence son aventure en tant que Voyageur ou Voyageuse
            dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au cours de
            l'aventure, le joueur a la possibilité de contrôler plusieurs autres personnages qu'il
            rencontre lors de son périple, chacun ayant une personnalité unique et des capacités`}
            </Text>
            <Text mt={2}>
              {`Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se sont
            vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de contrôler
            un des sept éléments. Le joueur commence son aventure en tant que Voyageur ou Voyageuse
            dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au cours de
            l'aventure, le joueur a la possibilité de contrôler plusieurs autres personnages qu'il
            rencontre lors de son périple, chacun ayant une personnalité unique et des capacités`}
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button variantSize="small" variant="primary">
              Hello
            </Button>
            <Button onClick={hide} variantSize="small" variant="secondary" color="gray.400">
              Close
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  </Flex>
)

export const withLongContent = LongTemplate.bind({})
withLongContent.storyName = 'with long content'
withLongContent.args = {}

const RenderPropsTemplate = (args: any) => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Modal
      scrollBehavior={args.scrollBehavior}
      {...args}
      ariaLabel="Genshin Impact"
      disclosure={
        <Button variant="primary" variantSize="medium">
          Open modal
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>Manga</Modal.Header.Label>
            <Heading>Genshin impact</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par miHoYo
            </Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button variantSize="small" variant="primary">
              Hello
            </Button>
            <Button onClick={hide} variantSize="small" variant="secondary" color="gray.400">
              Close
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  </Flex>
)

export const RenderProps = RenderPropsTemplate.bind({})
RenderProps.storyName = 'with render props'

const CustomTemplate = (args: any) => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Modal
      {...args}
      ariaLabel="Genshin Impact"
      width={['100%', '75%']}
      bg="blue.100"
      disclosure={
        <Button variant="primary" variantSize="medium">
          Open modal
        </Button>
      }
    >
      <Modal.Header>
        <Modal.Header.Label>Manga</Modal.Header.Label>
        <Heading>Genshin impact</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>
          <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par miHoYo
        </Text>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <Button variantSize="small" variant="primary">
          Hello
        </Button>
        <Button variantSize="small" variant="secondary" color="gray.400">
          Klee
        </Button>
      </Modal.Footer>
    </Modal>
  </Flex>
)

export const withCustom = CustomTemplate.bind({})
withCustom.storyName = 'with customization'

const ControlledTemplate = (args: any) => {
  const PersonModal = ({ person, show, onClose }) => {
    if (!person) return null
    return (
      <Modal {...args} show={show} onClose={onClose} ariaLabel="Une personne">
        <Modal.Header>
          <Modal.Header.Label>Manga</Modal.Header.Label>
          <Heading>Salut {person.name}</Heading>
        </Modal.Header>
        <Modal.Body>
          <Text>{person.description}</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" variantSize="medium" onClick={onClose}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const PERSONS = [
    {
      name: 'Mikasa',
      description: 'Une vaillante combatante.',
    },
    {
      name: 'Armin',
      description: 'Un fin stratège de guerre',
    },
    {
      name: 'Eren',
      description: "Je ne dirai rien car je ne l'apprécie point.",
    },
  ]
  const [personIndex, setPersonIndex] = useState(null)

  const selectChar = (index: number) => () => {
    setPersonIndex(index)
  }

  const person = personIndex !== null ? PERSONS[personIndex] : null
  return (
    <Flex gridGap={2} wrap="wrap" align="center">
      <PersonModal
        show={!!person}
        person={person}
        onClose={() => {
          setPersonIndex(null)
        }}
      />
      <Button onClick={selectChar(0)} variant="primary" variantSize="medium">
        Mikasa
      </Button>
      <Button onClick={selectChar(1)} variant="primary" variantSize="medium">
        Armin
      </Button>
      <Button onClick={selectChar(2)} variant="primary" variantSize="medium">
        Eren
      </Button>
    </Flex>
  )
}

export const controlled = ControlledTemplate.bind({})
