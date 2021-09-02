// @flow
import * as React from 'react';
import ProjectHeader from '~ui/Project/ProjectHeader';
import Flex from '~ui/Primitives/Layout/Flex';
import Avatar from '~ds/Avatar/Avatar';
import MockProviders from '~/testUtils';

export default {
  title: 'Design System/Project Header ',
  component: ProjectHeader,
  argTypes: {
    title: {
      control: { type: 'text' },
      defaultValue: 'Projet de loi pour une République numérique ',
    },
    coverURL: {
      control: { type: 'text' },
      defaultValue: 'https://source.unsplash.com/random/400x800',
    },
    onClick: { action: 'clicked' },
  },
};
const Template = (args: any) => (
  <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
    <Flex width={['100%', '1080px']} justify="center">
      <ProjectHeader>
        <ProjectHeader.Cover>
          <ProjectHeader.Content>
            <ProjectHeader.Authors active>
              <Avatar
                name="Mikasa Estucasa"
                src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
              />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="John Mark" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            </ProjectHeader.Authors>
            <ProjectHeader.Title>{args.title}</ProjectHeader.Title>
            <ProjectHeader.Blocks>
              <ProjectHeader.Block title="Contributions" content={8488} />
              <ProjectHeader.Block title="Jours restants" content={136} />
              <ProjectHeader.Block title="Votes" content={147529} />
              <ProjectHeader.Block title="Participants" content={21472} />
            </ProjectHeader.Blocks>
            <ProjectHeader.Info>
              <ProjectHeader.Info.Location content="Nantes" />
              <ProjectHeader.Info.Location content="Bellevue Chantenay Sainte-Anne" />
              <ProjectHeader.Info.Theme
                href="#"
                content="Projet de loi, consentement, seuil d’âge, mineur"
              />
            </ProjectHeader.Info>
            <ProjectHeader.Socials>
              <ProjectHeader.Social href="#" name="FACEBOOK" />
              <ProjectHeader.Social href="#" name="TWITTER" />
              <ProjectHeader.Social href="#" name="LINK" />
            </ProjectHeader.Socials>
          </ProjectHeader.Content>
          <ProjectHeader.CoverImage src={args.coverURL} alt={args.coverURL} />
        </ProjectHeader.Cover>
        <ProjectHeader.Frise>
          <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Sélection terminée avec un titre plus long que les autres"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />

            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Consultation"
              content="30 jours restants"
              tooltipLabel="30 jours restants"
              state="ACTIVE">
              <ProjectHeader.Step.Progress progress={50} />
            </ProjectHeader.Step>
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="WAITING"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="WAITING"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="WAITING"
            />
          </ProjectHeader.Steps>
        </ProjectHeader.Frise>
      </ProjectHeader>
    </Flex>
  </MockProviders>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

export const Mobile = Template.bind({});
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};
Mobile.args = {};

export const withoutCoverImage = (args: any) => (
  <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
    <Flex width={['100%', '1080px']} justify="center">
      <ProjectHeader>
        <ProjectHeader.Cover>
          <ProjectHeader.Content>
            <ProjectHeader.Authors active>
              <Avatar
                name="Mikasa Estucasa"
                src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
              />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="John Mark" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            </ProjectHeader.Authors>
            <ProjectHeader.Title>{args.title}</ProjectHeader.Title>
            <ProjectHeader.Blocks>
              <ProjectHeader.Block title="Contributions" content={8488} />
              <ProjectHeader.Block title="Jours restants" content={136} />
              <ProjectHeader.Block title="Votes" content={147529} />
              <ProjectHeader.Block title="Participants" content={21472} />
            </ProjectHeader.Blocks>
            <ProjectHeader.Info>
              <ProjectHeader.Info.Location content="Nantes" />
              <ProjectHeader.Info.Location content="Bellevue Chantenay Sainte-Anne" />
              <ProjectHeader.Info.Theme
                href="#"
                content="Projet de loi, consentement, seuil d’âge, mineur"
              />
            </ProjectHeader.Info>
            <ProjectHeader.Socials>
              <ProjectHeader.Social href="#" name="FACEBOOK" />
              <ProjectHeader.Social href="#" name="TWITTER" />
              <ProjectHeader.Social href="#" name="LINK" />
            </ProjectHeader.Socials>
          </ProjectHeader.Content>
        </ProjectHeader.Cover>
        <ProjectHeader.Frise>
          <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Consultation"
              content="30 jours restants"
              tooltipLabel="30 jours restants"
              state="ACTIVE">
              <ProjectHeader.Step.Progress progress={50} />
            </ProjectHeader.Step>
          </ProjectHeader.Steps>
        </ProjectHeader.Frise>
      </ProjectHeader>
    </Flex>
  </MockProviders>
);
export const withCoverVideo = (args: any) => (
  <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
    <Flex width={['100%', '1080px']} justify="center">
      <ProjectHeader>
        <ProjectHeader.Cover>
          <ProjectHeader.Content>
            <ProjectHeader.Authors active>
              <Avatar
                name="Mikasa Estucasa"
                src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
              />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="John Mark" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
              <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            </ProjectHeader.Authors>
            <ProjectHeader.Title>{args.title}</ProjectHeader.Title>
            <ProjectHeader.Blocks>
              <ProjectHeader.Block title="Contributions" content={8488} />
              <ProjectHeader.Block title="Jours restants" content={136} />
              <ProjectHeader.Block title="Votes" content={147529} />
              <ProjectHeader.Block title="Participants" content={21472} />
            </ProjectHeader.Blocks>
            <ProjectHeader.Info>
              <ProjectHeader.Info.Location content="Nantes" />
              <ProjectHeader.Info.Location content="Bellevue Chantenay Sainte-Anne" />
              <ProjectHeader.Info.Theme
                href="#"
                content="Projet de loi, consentement, seuil d’âge, mineur"
              />
            </ProjectHeader.Info>
            <ProjectHeader.Socials>
              <ProjectHeader.Social href="#" name="FACEBOOK" />
              <ProjectHeader.Social href="#" name="TWITTER" />
              <ProjectHeader.Social href="#" name="LINK" />
            </ProjectHeader.Socials>
          </ProjectHeader.Content>
          <ProjectHeader.CoverVideo
            url="https://www.youtube.com/embed/gAbi2_n8_Mw"
            src={args.coverURL}
            alt={args.coverURL}
          />
        </ProjectHeader.Cover>
        <ProjectHeader.Frise>
          <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
            <ProjectHeader.Step
              href="#"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              title="Consultation"
              content="30 jours restants"
              tooltipLabel="30 jours restants"
              state="ACTIVE">
              <ProjectHeader.Step.Progress progress={50} />
            </ProjectHeader.Step>
          </ProjectHeader.Steps>
        </ProjectHeader.Frise>
      </ProjectHeader>
    </Flex>
  </MockProviders>
);

export const withoutFrise = (args: any) => (
  <Flex width={['100%', '1080px']} justify="center">
    <ProjectHeader>
      <ProjectHeader.Cover>
        <ProjectHeader.Content>
          <ProjectHeader.Authors active>
            <Avatar
              name="Mikasa Estucasa"
              src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
            />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            <Avatar name="John Mark" />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
          </ProjectHeader.Authors>
          <ProjectHeader.Title>{args.title}</ProjectHeader.Title>
          <ProjectHeader.Blocks>
            <ProjectHeader.Block title="Contributions" content={8488} />
            <ProjectHeader.Block title="Jours restants" content={136} />
            <ProjectHeader.Block title="Votes" content={147529} />
            <ProjectHeader.Block title="Participants" content={21472} />
          </ProjectHeader.Blocks>
          <ProjectHeader.Info>
            <ProjectHeader.Info.Location content="Nantes" />
            <ProjectHeader.Info.Location content="Bellevue Chantenay Sainte-Anne" />
            <ProjectHeader.Info.Theme
              href="#"
              content="Projet de loi, consentement, seuil d’âge, mineur"
            />
          </ProjectHeader.Info>
          <ProjectHeader.Socials>
            <ProjectHeader.Social href="#" name="FACEBOOK" />
            <ProjectHeader.Social href="#" name="TWITTER" />
            <ProjectHeader.Social href="#" name="LINK" />
          </ProjectHeader.Socials>
        </ProjectHeader.Content>
        <ProjectHeader.CoverImage src={args.coverURL} alt={args.coverURL} />
      </ProjectHeader.Cover>
    </ProjectHeader>
  </Flex>
);

export const longTitle = Template.bind({});
longTitle.args = {
  title:
    'Êtes-vous pour ou contre la création d’un nouveau crime sexuel entre un majeur et un mineur de moins de 15 ans ?',
};
export const oneAuthor = (args: any) => (
  <Flex width={['100%', '1080px']} justify="center">
    <ProjectHeader>
      <ProjectHeader.Cover>
        <ProjectHeader.Content>
          <ProjectHeader.Authors active>
            <Avatar
              name="Mikasa Estucasa"
              src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
            />
          </ProjectHeader.Authors>
          <ProjectHeader.Title>{args.title}</ProjectHeader.Title>
          <ProjectHeader.Blocks>
            <ProjectHeader.Block title="Contributions" content={8488} />
            <ProjectHeader.Block title="Jours restants" content={136} />
            <ProjectHeader.Block title="Votes" content={147529} />
            <ProjectHeader.Block title="Participants" content={21472} />
          </ProjectHeader.Blocks>
          <ProjectHeader.Info>
            <ProjectHeader.Info.Location content="Nantes" />
            <ProjectHeader.Info.Location content="Bellevue Chantenay Sainte-Anne" />
            <ProjectHeader.Info.Theme
              href="#"
              content="Projet de loi, consentement, seuil d’âge, mineur"
            />
          </ProjectHeader.Info>
          <ProjectHeader.Socials>
            <ProjectHeader.Social href="#" name="FACEBOOK" />
            <ProjectHeader.Social href="#" name="TWITTER" />
            <ProjectHeader.Social href="#" name="LINK" />
          </ProjectHeader.Socials>
        </ProjectHeader.Content>
        <ProjectHeader.CoverImage src={args.coverURL} alt={args.coverURL} />
      </ProjectHeader.Cover>
      <ProjectHeader.Frise>
        <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
          <ProjectHeader.Step
            href="#"
            title="Dépots de projets"
            content="terminé"
            tooltipLabel="Terminé"
            state="FINISHED"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="FINISHED"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="FINISHED"
          />
          <ProjectHeader.Step
            href="#"
            title="Consultation"
            content="30 jours restants"
            tooltipLabel="30 jours restants"
            state="ACTIVE">
            <ProjectHeader.Step.Progress progress={50} />
          </ProjectHeader.Step>
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="WAITING"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="WAITING"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="WAITING"
          />
        </ProjectHeader.Steps>
      </ProjectHeader.Frise>
    </ProjectHeader>
  </Flex>
);

export const multipleAuthor = (args: any) => (
  <Flex width={['100%', '1080px']} justify="center">
    <ProjectHeader>
      <ProjectHeader.Cover>
        <ProjectHeader.Content>
          <ProjectHeader.Authors active>
            <Avatar
              name="Mikasa Estucasa"
              src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
            />
            <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
            <Avatar name="John Mark" />
          </ProjectHeader.Authors>
          <ProjectHeader.Title>{args.title}</ProjectHeader.Title>
          <ProjectHeader.Blocks>
            <ProjectHeader.Block title="Contributions" content={8488} />
            <ProjectHeader.Block title="Jours restants" content={136} />
            <ProjectHeader.Block title="Votes" content={147529} />
            <ProjectHeader.Block title="Participants" content={21472} />
          </ProjectHeader.Blocks>
          <ProjectHeader.Info>
            <ProjectHeader.Info.Location content="Nantes" />
            <ProjectHeader.Info.Location content="Bellevue Chantenay Sainte-Anne" />
            <ProjectHeader.Info.Theme
              href="#"
              content="Projet de loi, consentement, seuil d’âge, mineur"
            />
          </ProjectHeader.Info>
          <ProjectHeader.Socials>
            <ProjectHeader.Social href="#" name="FACEBOOK" />
            <ProjectHeader.Social href="#" name="TWITTER" />
            <ProjectHeader.Social href="#" name="LINK" />
          </ProjectHeader.Socials>
        </ProjectHeader.Content>
        <ProjectHeader.CoverImage src={args.coverURL} alt={args.coverURL} />
      </ProjectHeader.Cover>
      <ProjectHeader.Frise>
        <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
          <ProjectHeader.Step
            href="#"
            title="Dépots de projets"
            content="terminé"
            tooltipLabel="Terminé"
            state="FINISHED"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="FINISHED"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="FINISHED"
          />
          <ProjectHeader.Step
            href="#"
            title="Consultation"
            content="30 jours restants"
            tooltipLabel="30 jours restants"
            state="ACTIVE">
            <ProjectHeader.Step.Progress progress={50} />
          </ProjectHeader.Step>
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="WAITING"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="WAITING"
          />
          <ProjectHeader.Step
            href="#"
            title="Le vote des projets"
            content="30 jours restants"
            tooltipLabel="Test tooltip"
            state="WAITING"
          />
        </ProjectHeader.Steps>
      </ProjectHeader.Frise>
    </ProjectHeader>
  </Flex>
);
export const MultiFrise = (args: any) => (
  <Flex width={['100%', '1080px']} justify="center" direction="column">
    <ProjectHeader.Frise>
      <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Dépots de projets"
          content="terminé"
          tooltipLabel="Terminé"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="30 jours restants"
          tooltipLabel="Test tooltip"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="30 jours restants"
          tooltipLabel="Test tooltip"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Consultation"
          content="30 jours restants"
          tooltipLabel="30 jours restants"
          state="FINISHED">
          <ProjectHeader.Step.Progress progress={50} />
        </ProjectHeader.Step>
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="Arrive en 30 jours"
          tooltipLabel="Test tooltip"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="Arrive en 30 jours"
          tooltipLabel="Test tooltip"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="Arrive en 30 jours"
          tooltipLabel="Test tooltip"
          state="ACTIVE"
        />
      </ProjectHeader.Steps>
    </ProjectHeader.Frise>
    <ProjectHeader.Frise>
      <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Dépots de projets"
          content="terminé"
          tooltipLabel="Terminé"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="30 jours restants"
          tooltipLabel="Test tooltip"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Le vote des projets"
          content="30 jours restants"
          tooltipLabel="Test tooltip"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Consultation"
          content="30 jours restants"
          tooltipLabel="30 jours restants"
          state="ACTIVE">
          <ProjectHeader.Step.Progress progress={90} />
        </ProjectHeader.Step>
      </ProjectHeader.Steps>
    </ProjectHeader.Frise>
    <ProjectHeader.Frise>
      <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Dépots de projets"
          content="terminé"
          tooltipLabel="Terminé"
          state="ACTIVE">
          <ProjectHeader.Step.Progress progress={90} />
        </ProjectHeader.Step>
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Consultation"
          content="6 jours restants"
          state="FINISHED"
        />
        <ProjectHeader.Step
          href="#"
          onClick={args.onClick}
          title="Etape d'analyse des projets préalablement déposé préalablement préalablement"
          content=""
          tooltipLabel="Commence le 3 mai 2021"
          state="FINISHED"
        />
      </ProjectHeader.Steps>
    </ProjectHeader.Frise>
  </Flex>
);
