// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectHeader from './ProjectHeader';
import Avatar from '~ds/Avatar/Avatar';

const authors = [
  {
    id: '1',
    username: 'Mikasa Estucasa',
    url: '',
    avatarUrl: '',
  },
  {
    id: '2',
    username: 'John Mark',
    url: '',
    avatarUrl: '',
  },
  {
    id: '3',
    username: 'Dan Abramov',
    url: '',
    avatarUrl: '',
  },
  {
    id: '4',
    username: 'Dan Abramov',
    url: '',
    avatarUrl: '',
  },
  {
    id: '5',
    username: 'Dan Abramov',
    url: '',
    avatarUrl: '',
  },
  {
    id: '6',
    username: 'Dan Abramov',
    url: '',
    avatarUrl: '',
  },
  {
    id: '6',
    username: 'Dan Abramov',
    url: '',
    avatarUrl: '',
  },
];

describe('<ProjectHeader />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <ProjectHeader>
        <ProjectHeader.Cover isArchived={false}>
          <ProjectHeader.Content>
            <ProjectHeader.Authors active authors={authors}>
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
            <ProjectHeader.Title>Projet de loi pour une République numérique</ProjectHeader.Title>
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
              <ProjectHeader.Social onClick={() => {}} name="FACEBOOK" />
              <ProjectHeader.Social onClick={() => {}} name="TWITTER" />
              <ProjectHeader.Social onClick={() => {}} name="LINK" />
            </ProjectHeader.Socials>
          </ProjectHeader.Content>
          <ProjectHeader.CoverImage src="/cover.jpg" alt="Cover Image" isArchived={false} />
        </ProjectHeader.Cover>
        <ProjectHeader.Frise>
          <ProjectHeader.Steps currentStepIndex={0} modalTitle="Etapes de Consultation">
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step1"
              title="Dépots de projets"
              content="terminé"
              tooltipLabel="Terminé"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step2"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step3"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="FINISHED"
            />
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step4"
              title="Consultation"
              content="30 jours restants"
              tooltipLabel="30 jours restants"
              state="ACTIVE">
              <ProjectHeader.Step.Progress progress={50} />
            </ProjectHeader.Step>
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step5"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="WAITING"
            />
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step6"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="WAITING"
            />
            <ProjectHeader.Step
              href="#"
              url="#"
              stepId="step7"
              title="Le vote des projets"
              content="30 jours restants"
              tooltipLabel="Test tooltip"
              state="WAITING"
            />
          </ProjectHeader.Steps>
        </ProjectHeader.Frise>
      </ProjectHeader>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
