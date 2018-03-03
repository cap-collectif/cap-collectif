<?php

namespace Capco\AppBundle\Command\Paris;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ParisImportCommand extends ContainerAwareCommand
{
    protected const BATCH_SIZE = 100;

    protected const PROJECT_HEADER = [
        'id',
        'title',
        'body',
        'excerpt',
        'created_at',
        'updated_at',
        'project_id',
    ];

    protected const CATEGORY_HEADER = [
        'project_id',
        'name',
    ];

    protected const PROPOSAL_HEADER = [
        'project_id',
        'title',
        'district',
        'body',
        'status',
        'location',
        'cost',
        'objectif',
        'created_at',
    ];

    /** @var EntityManagerInterface */
    protected $em;

    protected $users = [];
    protected $projects = [];
    protected $proposals = [];
    protected $categories = [];

    protected function configure()
    {
        $this
            ->setName('capco:import:paris')
            ->setDescription('Import data from paris');
    }

    protected function initialize(InputInterface $input, OutputInterface $output)
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em->getConnection()->getConfiguration()->setSQLLogger(null);
        $this->users = $this->em->getRepository(User::class)->findAll();
        $this->categories = $this->createCategories();
        $this->proposals = $this->createProposals();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->importProjects($output);
    }

    protected function importProjects(OutputInterface $output): void
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_projects.csv');
        $rows = [];
        $type = $this->em->getRepository(ProjectType::class)->findOneBy(['title' => 'project.types.participatoryBudgeting']);
        $iterator = $csv->setOffset(1)->fetchAssoc(self::PROJECT_HEADER);
        foreach ($iterator as $item) {
            $rows[] = $item;
        }
        $output->writeln('<info>Importing projects...</info>');

        foreach ($rows as $row) {
            $user = $this->users[random_int(0, \count($this->users) - 1)];
            $introductionStep = (new PresentationStep())
                ->setTitle('Présentation')
                ->setLabel('Présentation')
                ->setBody($row['body']);
            $collectStep = (new CollectStep())
                ->setTitle('Dépôt')
                ->setLabel('Dépôt')
                ->setVoteType(VoteTypeTrait::$VOTE_TYPE_SIMPLE);

            $project = (new Project())
                ->setTitle($row['title'])
                ->setAuthor($user)
                ->setProjectType($type)
                ->setCreatedAt(new \DateTime($row['created_at']))
                ->setPublishedAt(new \DateTime($row['created_at']))
                ->setUpdatedAt(new \DateTime($row['updated_at']));
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
            $this->em->flush();

            $this->projects[$row['id']] = $project;

            $proposalForm = $this->createProposalForm($output, $project, $row['id']);

            $collectStep->setProposalForm($proposalForm);

            $this->em->persist($collectStep);

            $this->importDistricts($output, $proposalForm);
        }
        $this->em->clear();

        $this->reloadData();

        if (\count($this->projects) > 0) {
            foreach ($this->projects as $parisProjectId => $project) {
                $this->importProposals($output, $parisProjectId, $project);
            }
        }

        $output->write("\n");
        $output->writeln('<info>Successfuly imported ' . \count($this->projects) . ' projects.</info>');
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

    protected function importProposals(OutputInterface $output, int $parisProjectId, Project $project): void
    {
        if (isset($this->proposals[$parisProjectId])) {
            $output->writeln('<info>Importing proposals for project "' . $project->getTitle() . '"...</info>');
            $step = $project->getFirstCollectStep();
            $proposals = $this->proposals[$parisProjectId];
            $progress = new ProgressBar($output, \count($proposals));
            $count = 1;
            $users = $this->em->getRepository(User::class)->findAll();
            foreach ($proposals as $proposal) {
                $district = $step->getProposalForm()->getDistricts()->filter(function ($district) use ($proposal) {
                    return $district->getName() === $proposal['district'];
                })->first();
                $user = $users[random_int(0, \count($users) - 1)];
                $proposal = (new Proposal())
                    ->setTitle($proposal['title'])
                    ->setAuthor($user)
                    ->setProposalForm($step->getProposalForm())
                    ->setReference($count)
                    ->setBody($proposal['body'])
                    ->setDistrict($district)
                ;
                $this->em->persist($proposal);

                if (0 === $count % self::BATCH_SIZE) {
                    $this->printMemoryUsage($output);
                    $output->writeln('<info>Entities which are going to be flushed</info>');
                    $output->writeln('<info>Flushing entities...</info>');
                    $this->em->flush();
                    $output->writeln('<info>Clearing Entity Manager...</info>');
//                    $this->em->clear();
                }
                $progress->advance();
                ++$count;
            }
            $this->em->flush();
            $this->em->clear();
            $progress->finish();
            $output->writeln('<info>Successfuly imported proposals.</info>');
        } else {
            $output->writeln('<info>No proposals found for project "' . $project->getTitle() . '"</info>');
        }
    }

    protected function createProposalForm(OutputInterface $output, Project $project, int $parisProjectId): ProposalForm
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
            ->setUsingCategories(true)
            ->setUsingDistrict(true)
            ->setUsingAddress(true)
            ->setLatMap(48.8600561)
            ->setLngMap(2.3376982)
            ->setZoomMap(12)
            ->setProposalInAZoneRequired(true);

        $projectCategories = [];

        if (array_key_exists($parisProjectId, $this->categories)) {
            $projectCategories[] = $this->categories[$parisProjectId];
        }

        if (\count($projectCategories) > 0) {
            $projectCategories = array_map(function ($category) {
                return array_keys($category);
            }, $projectCategories)[0];
        }

        foreach ($projectCategories as $categoryName) {
            $category = (new ProposalCategory())
                ->setName($categoryName);
            $proposalForm->addCategory($category);
        }

        $this->em->persist($proposalForm);
        $this->em->flush();

        $output->writeln('<info>Successfuly added "' . $formName . '" form.</info>');

        return $proposalForm;
    }

    protected function createCategories(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_categories.csv');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::CATEGORY_HEADER);
        $categories = [];
        foreach ($iterator as $item) {
            $categories[] = $item;
        }

        $categories = $this->array_group_by($categories, function ($i) {
            return $i['project_id'];
        });

        return array_map(function ($category) {
            return $this->array_unique_nested($category, 'name');
        }, $categories);
    }

    protected function createProposals(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_proposals.csv');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::PROPOSAL_HEADER);
        $proposals = [];
        foreach ($iterator as $item) {
            $proposals[] = $item;
        }
        $proposals = $this->array_group_by($proposals, function ($i) {
            return $i['project_id'];
        });

        return $proposals;
    }

    private function reloadData(): void
    {
        foreach ($this->projects as $parisProjectId => $project) {
            $this->projects[$parisProjectId] = $this->em->merge($project);
        }
        foreach ($this->users as &$user) {
            $user = $this->em->merge($user);
        }
    }

    private function printMemoryUsage(OutputInterface $output): void
    {
        $output->write("\n");
        $output->writeln(sprintf('Memory usage (currently) %dKB/ (max) %dKB', round(memory_get_usage(true) / 1024), memory_get_peak_usage(true) / 1024));
    }

    private function array_group_by(array $arr, callable $key_selector): array
    {
        $result = [];
        foreach ($arr as $i) {
            $key = call_user_func($key_selector, $i);
            $result[$key][] = $i;
        }

        return $result;
    }

    private function array_unique_nested(array $array, string $uniqueKey)
    {
        if (!is_array($array)) {
            return [];
        }
        $uniqueKeys = [];
        foreach ($array as $key => $item) {
            if (!in_array($item[$uniqueKey], $uniqueKeys, true)) {
                $uniqueKeys[$item[$uniqueKey]] = $item;
            }
        }

        return $uniqueKeys;
    }
}
