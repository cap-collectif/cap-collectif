<?php

namespace Capco\AppBundle\Command\Paris;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Persistence\ObjectManager;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ParisImportCommand extends ContainerAwareCommand
{
    protected const HEADER_MAP = [
        'title' => 0,
        'body' => 1,
        'excerpt' => 2,
    ];

    protected const BATCH_SIZE = 15;
    /**
     * @var ObjectManager
     */
    protected $em;

    protected function configure()
    {
        $this
            ->setName('capco:import:paris')
            ->setDescription('Import data from paris')
            ->addArgument('proposalFormName', InputArgument::OPTIONAL, 'The title of the proposal form', 'Formulaire Paris');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->em = $this->getContainer()->get('doctrine')->getManager();

        $proposalForm = $this->createProposalForm($output, $input);

        $this->importProjects($output);

        $this->importDistricts($output, $proposalForm);
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
            $interval = new \DateInterval('P3D');
            $introductionStep = (new PresentationStep())
                ->setTitle('Présentation')
                ->setBody($row[self::HEADER_MAP['body']])
                ->setStartAt((new \DateTime())->sub($interval))
                ->setEndAt((new \DateTime())->add($interval))
            ;
            $this->em->persist($introductionStep);
            $project = (new Project())
                ->setTitle($row[self::HEADER_MAP['title']])
                ->setAuthor($user)
                ->setProjectType($type)
            ;
            $this->em->persist($project);
            $project->addStep(
                (new ProjectAbstractStep())
                ->setProject($project)
                ->setStep($introductionStep)
                ->setPosition(1)
            );

            $progress->advance();
        }
        $this->em->flush();
        $progress->finish();
        $output->writeln('<info>Successfuly imported ' . \count($rows) . ' projects.</info>');
    }

    protected function importDistricts(OutputInterface $output, ProposalForm $proposalForm): void
    {
        $output->writeln('<info>Importing districts...</info>');

        $json = \GuzzleHttp\json_decode(file_get_contents(__DIR__ . '/districts.geojson'), true);
        foreach ($json['features'] as $district) {
            $entity = (new District())
                ->setName($district['properties']['nom'])
                ->setGeojson(\GuzzleHttp\json_encode($district))
                ->setForm($proposalForm);
            $this->em->persist($entity);
        }
        $this->em->flush();
    }

    protected function createProposalForm(OutputInterface $output, InputInterface $input): ProposalForm
    {
        $proposalForm = (new ProposalForm())
            ->setTitle($input->getArgument('proposalFormName'))
            ->setUsingDistrict(true)
            ->setUsingAddress(true)
            ->setLatMap(48.8600561)
            ->setLngMap(2.3376982)
            ->setZoomMap(12)
            ->setProposalInAZoneRequired(true);

        $this->em->persist($proposalForm);
        $this->em->flush();

        $output->writeln('<info>Successfuly added ' . $input->getArgument('proposalFormName') . ' form.</info>');

        return $proposalForm;
    }
}
