// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from 'storybook-addon-knobs';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';

const scrollBehaviour = () =>
  select('scrollBehavior', { inside: 'inside', outstide: 'outside' }, 'inside');

storiesOf('Design system|Modal', module)
  .add('default', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Genshin Impact"
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          <Modal.Header>
            <Heading>Genshin impact</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par
              miHoYo
            </Text>
            <Text mt={2}>
              Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se
              sont vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de
              contrôler un des sept éléments. Le joueur commence son aventure en tant que Voyageur
              ou Voyageuse dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au
              cours de l'aventure, le joueur a la possibilité de contrôler plusieurs autres
              personnages qu'il rencontre lors de son périple, chacun ayant une personnalité unique
              et des capacités spéciales, alors qu'ils entreprennent des quêtes pour comprendre la
              vérité sur les dieux primordiaux de ce monde
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
    );
  })
  .add('allow body scroll', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Genshin Impact"
          preventBodyScroll={false}
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          <Modal.Header>
            <Heading>Genshin impact</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par
              miHoYo
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
    );
  })
  .add('keep on click outside', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Genshin Impact"
          hideOnClickOutside={false}
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          <Modal.Header>
            <Heading>Genshin impact</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par
              miHoYo
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
    );
  })
  .add('do not hide when pressing esc', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Genshin Impact"
          hideOnEsc={false}
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          <Modal.Header>
            <Heading>Genshin impact</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par
              miHoYo
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
    );
  })
  .add('with long content', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Genshin Impact"
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          {({ hide }) => (
            <>
              <Modal.Header>
                <Heading>Genshin impact</Heading>
              </Modal.Header>
              <Modal.Body>
                <Text>
                  <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par
                  miHoYo
                </Text>
                <Text mt={2}>
                  Vous pouvez changer le comportement du scroll grâce à la props{' '}
                  <code>scrollBehavior</code>, accessible dans les knobs de la story. Bref, revenons
                  en à Genshin Impact.
                </Text>
                <Text mt={2}>
                  Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux
                  se sont vu attribuer un Œil Divin — une gemme qui confère à son porteur la
                  capacité de contrôler un des sept éléments. Le joueur commence son aventure en
                  tant que Voyageur ou Voyageuse dont l'origine est inconnue, à la recherche d'un(e)
                  proche disparu(e). Au cours de l'aventure, le joueur a la possibilité de contrôler
                  plusieurs autres personnages qu'il rencontre lors de son périple, chacun ayant une
                  personnalité unique et des capacités spéciales, alors qu'ils entreprennent des
                  quêtes pour comprendre la vérité sur les dieux primordiaux de ce monde
                </Text>
                <Text mt={2}>
                  Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux
                  se sont vu attribuer un Œil Divin — une gemme qui confère à son porteur la
                  capacité de contrôler un des sept éléments. Le joueur commence son aventure en
                  tant que Voyageur ou Voyageuse dont l'origine est inconnue, à la recherche d'un(e)
                  proche disparu(e). Au cours de l'aventure, le joueur a la possibilité de contrôler
                  plusieurs autres personnages qu'il rencontre lors de son périple, chacun ayant une
                  personnalité unique et des capacités spéciales, alors qu'ils entreprennent des
                  quêtes pour comprendre la vérité sur les dieux primordiaux de ce monde
                </Text>
                <Text mt={2}>
                  Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux
                  se sont vu attribuer un Œil Divin — une gemme qui confère à son porteur la
                  capacité de contrôler un des sept éléments. Le joueur commence son aventure en
                  tant que Voyageur ou Voyageuse dont l'origine est inconnue, à la recherche d'un(e)
                  proche disparu(e). Au cours de l'aventure, le joueur a la possibilité de contrôler
                  plusieurs autres personnages qu'il rencontre lors de son périple, chacun ayant une
                  personnalité unique et des capacités spéciales, alors qu'ils entreprennent des
                  quêtes pour comprendre la vérité sur les dieux primordiaux de ce monde
                </Text>
                <Text mt={2}>
                  Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux
                  se sont vu attribuer un Œil Divin — une gemme qui confère à son porteur la
                  capacité de contrôler un des sept éléments. Le joueur commence son aventure en
                  tant que Voyageur ou Voyageuse dont l'origine est inconnue, à la recherche d'un(e)
                  proche disparu(e). Au cours de l'aventure, le joueur a la possibilité de contrôler
                  plusieurs autres personnages qu'il rencontre lors de son périple, chacun ayant une
                  personnalité unique et des capacités spéciales, alors qu'ils entreprennent des
                  quêtes pour comprendre la vérité sur les dieux primordiaux de ce monde
                </Text>
                <Text mt={2}>
                  Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux
                  se sont vu attribuer un Œil Divin — une gemme qui confère à son porteur la
                  capacité de contrôler un des sept éléments. Le joueur commence son aventure en
                  tant que Voyageur ou Voyageuse dont l'origine est inconnue, à la recherche d'un(e)
                  proche disparu(e). Au cours de l'aventure, le joueur a la possibilité de contrôler
                  plusieurs autres personnages qu'il rencontre lors de son périple, chacun ayant une
                  personnalité unique et des capacités spéciales, alors qu'ils entreprennent des
                  quêtes pour comprendre la vérité sur les dieux primordiaux de ce monde
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
    );
  })
  .add('with render props', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Genshin Impact"
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          {({ hide }) => (
            <>
              <Modal.Header>
                <Heading>Genshin impact</Heading>
              </Modal.Header>
              <Modal.Body>
                <Text>
                  <b>Genshin Impact</b> est un jeu vidéo de type <em>action-RPG</em> développé par
                  miHoYo
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
    );
  })
  .add('with customization', () => (
    <Flex gridGap={2} wrap="wrap" align="center">
      <Modal
        scrollBehavior={scrollBehaviour()}
        ariaLabel="Genshin Impact"
        width={['100%', '75%']}
        bg="blue.100"
        disclosure={
          <Button variant="primary" variantSize="medium">
            Open modal
          </Button>
        }>
        <Modal.Header>
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
  ));
