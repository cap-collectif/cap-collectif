<?php

namespace Capco\AppBundle\Command\Paris;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ParisImportCommand extends ContainerAwareCommand
{
    protected const HEADER_MAP = [
        'title' => 0,
        'body' => 1,
        'excerpt' => 2,
        'created_at' => 3,
        'updated_at' => 4,
    ];

    protected const BATCH_SIZE = 15;

    protected $em;

    protected function configure()
    {
        $this
            ->setName('capco:import:paris')
            ->setDescription('Import data from paris')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->em = $this->getContainer()->get('doctrine')->getManager();

        $this->importProjects($output);
    }

    protected function importProjects(OutputInterface $output): void
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_projects.csv');
        $user = $this->em->getRepository(User::class)->findOneBy(['username' => 'welcomattic']);
        $type = $this->em->getRepository(ProjectType::class)->findOneBy(['title' => 'project.types.participatoryBudgeting']);
        $rows = $csv->setOffset(1)->fetchAll();

        $output->writeln('<info>Importing projects...</info>');

        $progress = new ProgressBar($output, \count($rows));
        foreach ($rows as $row) {
            $introductionStep = (new PresentationStep())
                ->setTitle('Présentation')
                ->setLabel('Présentation')
                ->setBody($row[self::HEADER_MAP['body']])
            ;
            $collectStep = (new CollectStep())
                ->setTitle('Dépôt')
                ->setLabel('Dépôt')
                ->setVoteType(VoteTypeTrait::$VOTE_TYPE_SIMPLE)
            ;

            $project = (new Project())
                ->setTitle($row[self::HEADER_MAP['title']])
                ->setAuthor($user)
                ->setProjectType($type)
                ->setCreatedAt(new \DateTime($row[self::HEADER_MAP['created_at']]))
                ->setPublishedAt(new \DateTime($row[self::HEADER_MAP['created_at']]))
                ->setUpdatedAt(new \DateTime($row[self::HEADER_MAP['updated_at']]))
            ;
            $project->addStep(
                (new ProjectAbstractStep())
                ->setProject($project)
                ->setStep($introductionStep)
                ->setPosition(1)
            );
            $project->addStep(
                (new ProjectAbstractStep())
                    ->setProject($project)
                    ->setStep($collectStep)
                    ->setPosition(2)
            );

            $this->em->persist($project);

            $proposalForm = $this->createProposalForm($output, $project);

            $collectStep->setProposalForm($proposalForm);

            $this->em->persist($collectStep);

            $this->importDistricts($output, $proposalForm);

            $progress->advance();
        }
        $this->em->flush();
        $progress->finish();
        $output->writeln('<info>Successfuly imported ' . \count($rows) . ' projects.</info>');
    }

    protected function importDistricts(OutputInterface $output, ProposalForm $proposalForm): void
    {
        $output->writeln('<info>Importing districts for ' . $proposalForm->getStep()->getTitle() . '...</info>');

        $json = \GuzzleHttp\json_decode(file_get_contents(__DIR__ . '/districts.geojson'), true);
        foreach ($json['features'] as $district) {
            $entity = (new District())
                ->setName($district['properties']['nom'])
                ->setGeojson(\GuzzleHttp\json_encode($district))
                ->setForm($proposalForm);
            $this->em->persist($entity);
        }
        $this->em->flush();

        $output->writeln('<info>Successfuly imported districts.</info>');
    }

    protected function createProposalForm(OutputInterface $output, Project $project): ProposalForm
    {
        $formName = 'Formulaire pour "' . $project->getTitle() . '"';
        $output->writeln('<info>Creating "' . $formName . '" form...</info>');

        $proposalForm = (new ProposalForm())
            ->setTitle($formName)
            ->setTitleHelpText('Choisissez un titre pour votre proposition')
            ->setDescriptionHelpText('Décrivez votre proposition')
            ->setThemeHelpText('Sélectionnez un thème')
            ->setDistrictHelpText('Sélectionnez une zone géographique')
            ->setCategoryHelpText('Sélectionnez une catégorie.')
            ->setUsingDistrict(true)
            ->setUsingAddress(true)
            ->setLatMap(48.8600561)
            ->setLngMap(2.3376982)
            ->setZoomMap(12)
            ->setProposalInAZoneRequired(true);

        $this->em->persist($proposalForm);
        $this->em->flush();

        $output->writeln('<info>Successfuly added "' . $formName . '" form.</info>');

        return $proposalForm;
    }
}
