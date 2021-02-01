// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from 'storybook-addon-knobs';
import { useState } from 'react';
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
  .add('without backdrop', () => {
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <Modal
          noBackdrop
          scrollBehavior={scrollBehaviour()}
          ariaLabel="Confirmer"
          disclosure={
            <Button variant="primary" variantSize="medium">
              Open modal
            </Button>
          }>
          <Modal.Header display={['none', 'flex']}>
            <Heading>Êtes vous sûr ?</Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex spacing={4} direction={['column', 'row']} justify={['center', 'flex-end']}>
              <Button
                justifyContent="center"
                variant="primary"
                variantColor="primary"
                variantSize="medium">
                Publier
              </Button>
              <Button
                justifyContent="center"
                variant="primary"
                variantColor="danger"
                variantSize="medium">
                Supprimer
              </Button>
            </Flex>
          </Modal.Body>
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
  ))
  .add('controlled', () => {
    const PersonModal = ({ person, show, onClose }) => {
      if (!person) return null;
      return (
        <Modal show={show} onClose={onClose} ariaLabel="Une personne">
          <Modal.Header>
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
      );
    };
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
    ];
    const [personIndex, setPersonIndex] = useState(null);
    const selectChar = (index: number) => () => {
      setPersonIndex(index);
    };
    const person = personIndex !== null ? PERSONS[personIndex] : null;
    return (
      <Flex gridGap={2} wrap="wrap" align="center">
        <PersonModal
          show={!!person}
          person={person}
          onClose={() => {
            setPersonIndex(null);
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
    );
  });
