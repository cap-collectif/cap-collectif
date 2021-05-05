// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import { ICON_NAME } from '~ds/Icon/Icon';
import ConfirmModal from '~ds/Modal/ConfirmModal';
import { wait } from '~/utils/wait';
import { toast } from '~ds/Toast';

export default {
  title: 'Design system/ConfirmModal',
  component: ConfirmModal,
  argTypes: {},
};
const Template = () => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Modal
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
              {`Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se sont
            vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de contrôler
            un des sept éléments. Le joueur commence son aventure en tant que Voyageur ou Voyageuse
            dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au cours de
            l'aventure, le joueur a la possibilité de contrôler plusieurs autres personnages qu'il
            rencontre lors de son périple, chacun ayant une personnalité unique et des capacités`}
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmModal
              onConfirm={() => {
                toast({
                  variant: 'success',
                  content: 'onConfirm',
                });
                hide();
              }}
              onCancel={() => {
                toast({
                  variant: 'success',
                  content: 'onCancel',
                });
              }}
              options={{
                cancelButton: {
                  content: 'Annuler',
                },
                confirmButton: {
                  content: 'Supprimer',
                  props: {
                    leftIcon: 'TRASH',
                  },
                },
              }}
              title="Tu en es bien sûr ?"
              disclosure={
                <Button
                  width={['100%', 'auto']}
                  justifyContent={['center', 'flex-start']}
                  variantSize="medium"
                  variant="primary"
                  variantColor="danger"
                  leftIcon={ICON_NAME.TRASH}
                  color="gray.400">
                  Supprimer Genshin Impact
                </Button>
              }
              ariaLabel="Confirmer la suppression"
            />
          </Modal.Footer>
        </>
      )}
    </Modal>
  </Flex>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

const PromiseTemplate = () => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Modal
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
              {`Dans un monde fantastique nommé Teyvat, certains individus choisis par les dieux se sont
            vu attribuer un Œil Divin — une gemme qui confère à son porteur la capacité de contrôler
            un des sept éléments. Le joueur commence son aventure en tant que Voyageur ou Voyageuse
            dont l'origine est inconnue, à la recherche d'un(e) proche disparu(e). Au cours de
            l'aventure, le joueur a la possibilité de contrôler plusieurs autres personnages qu'il
            rencontre lors de son périple, chacun ayant une personnalité unique et des capacités`}
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmModal
              onConfirm={async () => {
                await wait(1000);
                toast({
                  variant: 'success',
                  content: 'onConfirm',
                });
                hide();
              }}
              options={{
                cancelButton: {
                  content: 'Annuler',
                },
                confirmButton: {
                  content: 'Supprimer',
                  props: {
                    leftIcon: ICON_NAME.TRASH,
                  },
                },
              }}
              title="Tu en es bien sûr ?"
              disclosure={
                <Button
                  width={['100%', 'auto']}
                  justifyContent={['center', 'flex-start']}
                  variantSize="medium"
                  variant="primary"
                  variantColor="danger"
                  leftIcon={ICON_NAME.TRASH}
                  color="gray.400">
                  Supprimer Genshin Impact
                </Button>
              }
              ariaLabel="Confirmer la suppression"
            />
          </Modal.Footer>
        </>
      )}
    </Modal>
  </Flex>
);

export const withPromisesCallbacks = PromiseTemplate.bind({});
