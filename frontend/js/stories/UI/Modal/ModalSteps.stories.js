// @flow
import * as React from 'react';
import Button from '~ds/Button/Button';
import ModalSteps from '~ds/ModalSteps/ModalSteps';
import ModalHeaderLabel from '~ds/Modal/ModalHeaderLabel';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';

export default {
  title: 'Design system/ModalSteps',
  component: ModalSteps,
  argTypes: {
    defaultStepId: {
      control: {
        type: 'text',
        required: false,
      },
      description: 'default step display',
    },
    resetStepOnClose: {
      control: {
        type: 'boolean',
        required: false,
      },
      description: 'reset step display on close',
    },
  },
};

const ModalOne = () => (
  <AppBox>
    <Text>Coucou</Text>
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium aliquid at
      doloribus eligendi eos, facilis illo iusto laboriosam minima. Accusamus animi beatae cum
      dignissimos doloremque esse explicabo fugit in iure modi nam, officiis perferendis
      perspiciatis possimus quisquam rerum sapiente. Aut culpa ipsum libero non sed soluta, sunt
      voluptates. Nihil?
    </Text>
  </AppBox>
);

const ModalTwo = () => (
  <AppBox>
    <Text>Encore une</Text>
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet aperiam distinctio eligendi
      iusto natus possimus quaerat quia suscipit vero voluptates. Culpa impedit iste omnis porro
      sint! A architecto eius eos facilis id impedit necessitatibus quo sint veritatis voluptatem.
      Aspernatur atque consectetur, consequuntur culpa cupiditate doloribus nisi optio quis vitae
      voluptatem! Adipisci asperiores commodi consectetur consequuntur cumque, ducimus fuga iste
      quidem quod sunt? Ab blanditiis debitis, dicta distinctio doloribus incidunt inventore libero
      perferendis repudiandae voluptate! Ab animi asperiores culpa cupiditate delectus deserunt,
      dolores et incidunt inventore iure, magni officia praesentium quod rem reprehenderit soluta
      tempore veniam voluptatem. Exercitationem laudantium neque sapiente?
    </Text>
  </AppBox>
);

const ModalThree = () => (
  <AppBox>
    <Text>Fini</Text>
    <Text>Bye</Text>
  </AppBox>
);

const Template = () => (
  <ModalSteps
    ariaLabel="Genshin Impact"
    disclosure={
      <Button variant="primary" variantSize="medium">
        Open modal
      </Button>
    }>
    {({ hide }) => (
      <>
        <ModalSteps.Header>
          <ModalHeaderLabel>Dire que jaime les fruits</ModalHeaderLabel>
        </ModalSteps.Header>
        <ModalSteps.ProgressBar />

        <ModalSteps.Body>
          <ModalOne id="one" label="Jaime les pommes" validationLabel="Voir les poires" />
          <ModalTwo id="two" label="Jaime les poires" validationLabel="Voir la suite" />
          <ModalThree id="three" validationLabel="Fermer" />
        </ModalSteps.Body>

        <ModalSteps.Footer>
          <ModalSteps.Footer.BackButton />
          <ModalSteps.Footer.ContinueButton />
          <ModalSteps.Footer.ValidationButton onClick={hide} />
        </ModalSteps.Footer>
      </>
    )}
  </ModalSteps>
);

export const Default = Template.bind({});
Default.args = {};
