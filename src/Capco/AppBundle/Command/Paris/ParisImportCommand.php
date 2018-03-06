<?php

namespace Capco\AppBundle\Command\Paris;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\EventListener\ReferenceEventListener;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Cocur\Slugify\Slugify;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection as CollectionInterface;
use Doctrine\ORM\EntityManagerInterface;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ParisImportCommand extends ContainerAwareCommand
{
    protected const PROPOSAL_BATCH_SIZE = 200;
    protected const COMMENT_BATCH_SIZE = 500;

    protected const PROJECT_HEADER = [
        'id',
        'title',
        'body',
        'excerpt',
        'created_at',
        'updated_at',
        'end_at',
        'filename',
    ];

    protected const CATEGORY_HEADER = [
        'project_id',
        'name',
    ];

    protected const COMMENT_HEADER = [
        'proposal_id',
        'body',
        'created_at',
        'updated_at',
    ];

    protected const PROPOSAL_HEADER = [
        'project_id',
        'proposal_id',
        'title',
        'district',
        'category',
        'body',
        'status',
        'location',
        'cost',
        'diagnostic',
        'objectif',
        'created_at',
        'updated_at',
    ];

    protected const STATUSES = [
        ['Arbitrage' => 'info'],
        ['Atelier' => 'info'],
        ['Discussion' => 'info'],
        ['Étude' => 'info'],
        ['Nouvelle' => 'info'],
        ['Refusée' => 'danger'],
        ['Retenu' => 'success'],
        ['Vote' => 'success'],
    ];

    /** @var EntityManagerInterface */
    protected $em;

    protected $users = [];
    protected $projects = [];
    protected $proposals = [];
    protected $categories = [];
    protected $comments = [];

    protected function configure()
    {
        $this
            ->setName('capco:import:paris')
            ->setDescription('(Import data from paris');
    }

    protected function initialize(InputInterface $input, OutputInterface $output)
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em->getConnection()->getConfiguration()->setSQLLogger(null);
        $this->users = $this->em->getRepository(User::class)->findAll();
        $this->categories = $this->createCategories();
        $this->proposals = $this->createProposals();
        $this->comments = $this->createComments();
        foreach ($this->em->getEventManager()->getListeners() as $event => $listeners) {
            foreach ($listeners as $key => $listener) {
                if ($listener instanceof ReferenceEventListener) {
                    $this->em->getEventManager()->removeEventListener(['preFlush'], $listener);
                    $output->writeln('Disabled Reference Listener');
                }
            }
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $stopwatch = new Stopwatch();
        $stopwatch->start('import');
        $this->importProjects($output);
        $event = $stopwatch->stop('import');
        $output->writeln("\n<info>Elapsed time : " . $event->getDuration() / 1000 . " seconds. \n Memory usage : " . $event->getMemory() / 1000000 . ' MB</info>');
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
                ->setStartAt(new \DateTime($row['created_at']))
                ->setEndAt(new \DateTime($row['end_at']))
                ->setVoteType(VoteTypeTrait::$VOTE_TYPE_SIMPLE);
            $thumbnail = $this->getContainer()->get('capco.media.manager')->createImageFromPath(
                __DIR__ . '/images/' . $row['filename']
            );
            $project = (new Project())
                ->setTitle($row['title'])
                ->setAuthor($user)
                ->setProjectType($type)
                ->setCreatedAt(new \DateTime($row['created_at']))
                ->setPublishedAt(new \DateTime($row['created_at']))
                ->setUpdatedAt(new \DateTime($row['updated_at']))
                ->setCover($thumbnail);
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

            $collectStep
                ->setProposalForm($proposalForm)
                ->setStatuses($this->createStatuses());

            $this->em->persist($collectStep);

            $this->importDistricts($output, $proposalForm);
        }
        $this->em->flush();
        $this->em->clear();

        $this->reloadData();

        if (\count($this->projects) > 0) {
            foreach ($this->projects as $parisProjectId => $project) {
                $this->importProposals($output, $parisProjectId, $project);
            }
        }
        $output->writeln("\n<info>Successfuly imported " . \count($this->projects) . ' projects.</info>');
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
        $output->writeln('<info>Successfuly imported districts.</info>');
    }

    protected function importProposals(OutputInterface $output, int $parisProjectId, Project $project): void
    {
        $step = $project->getFirstCollectStep();
        if ($step && isset($this->proposals[$parisProjectId])) {
            $output->writeln("\n<info>Importing proposals for project \"" . $project->getTitle() . '"...</info>');
            $proposals = $this->proposals[$parisProjectId];
            $questions = $step->getProposalForm()->getRealQuestions();
            $categories = $step->getProposalForm()->getCategories();
            $statuses = $step->getStatuses();
            $progress = new ProgressBar($output, \count($proposals));
            $count = 1;
            $users = $this->em->getRepository(User::class)->findAll();
            foreach ($proposals as $proposal) {
                $proposalParisId = $proposal['proposal_id'];
                $district = $this->em->getRepository(District::class)->findOneBy(
                    ['form' => $step->getProposalForm(), 'name' => $proposal['district']]
                );
                $user = $users[\random_int(0, \count($users) - 1)];
                $responses = $this->createResponses($proposal, $questions);
                $category = $categories->filter(function (ProposalCategory $category) use ($proposal) {
                    return false !== stripos($category->getName(), $proposal['category']);
                })->first();
                $proposal = (new Proposal())
                    ->setTitle($proposal['title'])
                    ->setAuthor($user)
                    ->setProposalForm($step->getProposalForm())
                    ->setResponses(new ArrayCollection($responses))
                    ->setCreatedAt(new \DateTime($proposal['created_at']))
                    ->setUpdatedAt(new \DateTime($proposal['updated_at']))
                    ->setReference($count)
                    ->setBody($proposal['body'])
                    ->setStatus(
                        $statuses->filter(function (Status $status) use ($proposal) {
                            return false !== stripos(
                                    Slugify::create()->slugify($status->getName()),
                                    $proposal['status']
                                );
                        })->first()
                    )
                    ->setDistrict($district, false);
                if ($category) {
                    $proposal->setCategory($category);
                }
                $this->em->persist($proposal);
                $this->importComments($output, $proposal, $proposalParisId, $users);
                if (0 === $count % self::PROPOSAL_BATCH_SIZE) {
                    $this->printMemoryUsage($output);
                    $this->em->flush();
                    $this->em->clear(AbstractResponse::class);
                    $this->em->clear(Proposal::class);
                }
                $progress->advance();
                ++$count;
            }
            $this->em->flush();
            $this->em->clear(AbstractResponse::class);
            $this->em->clear(Proposal::class);
            $progress->finish();
            $output->writeln("\n<info>Successfuly imported proposals.</info>");
        } else {
            $output->writeln("\n<info>No proposals found for project \"" . $project->getTitle() . '"</info>');
        }
    }

    protected function importComments(OutputInterface $output, Proposal $proposal, int $proposalParisId, array $users): void
    {
        if (isset($this->comments[$proposalParisId])) {
            $output->writeln("\n<info>Importing comments for proposal \"" . $proposal->getTitle() . '"</info>');
            $comments = $this->comments[$proposalParisId];
            $progress = new ProgressBar($output, \count($comments));
            $count = 1;
            foreach ($comments as $comment) {
                $user = $users[\random_int(0, \count($users) - 1)];
                $comment = (new ProposalComment())
                    ->setProposal($proposal, false)
                    ->setAuthor($user)
                    ->setCreatedAt(new \DateTime($comment['created_at']))
                    ->setUpdatedAt(new \DateTime($comment['updated_at']))
                    ->setBody($comment['body']);
                $this->em->persist($comment);
                if (0 === $count % self::COMMENT_BATCH_SIZE) {
                    $this->em->flush();
                    $this->em->clear(Comment::class);
                }
                $progress->advance();
                ++$count;
            }
            $this->em->flush();
            $this->em->clear(Comment::class);
            $progress->finish();
            $output->writeln("\n<info>Successfuly imported comments for proposal.</info>");
        } else {
            $output->writeln('<info>No comments found for proposal "' . $proposal->getTitle() . '"</info>');
        }
    }

    protected function importQuestions(ProposalForm $proposalForm, array $questions): void
    {
        $i = 0;
        foreach ($questions as $title) {
            $question = (new SimpleQuestion())
                ->setTitle($title)
                ->setType(AbstractQuestion::QUESTION_TYPE_MULTILINE_TEXT);
            $questionnaireQuestion = (new QuestionnaireAbstractQuestion())
                ->setPosition($i)
                ->setQuestion($question);
            $proposalForm->addQuestion($questionnaireQuestion);
            ++$i;
        }
        unset($i);
    }

    protected function createResponses(array $row, CollectionInterface $questions): array
    {
        $responses = [];
        $questionColumns = ['objectif', 'diagnostic'];
        foreach ($questionColumns as $questionColumn) {
            if ($row[$questionColumn]) {
                $question = $questions->filter(function (AbstractQuestion $question) use ($questionColumn) {
                    return false !== stripos($question->getTitle(), $questionColumn);
                })->first();
                if ($question) {
                    $responses[] = (new ValueResponse())
                        ->setValue($row[$questionColumn])
                        ->setQuestion($question);
                }
            }
        }

        return $responses;
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
            ->setReference($parisProjectId)
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

        $this->importQuestions($proposalForm, [
            'Objectif',
            "Diagnostic / Inspiration / Exemples d'expérimentation passée",
        ]);

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

    protected function createComments(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_comments.csv');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::COMMENT_HEADER);
        $comments = [];
        foreach ($iterator as $item) {
            $comments[] = $item;
        }
        $comments = $this->array_group_by($comments, function ($i) {
            return $i['proposal_id'];
        });

        return $comments;
    }

    protected function createStatuses(): CollectionInterface
    {
        $statuses = new ArrayCollection();
        $i = 0;
        foreach (self::STATUSES as $status) {
            $statusName = array_keys($status)[0];
            $status = (new Status())
                ->setName($statusName)
                ->setPosition($i)
                ->setColor($status[$statusName]);
            ++$i;
            $statuses->add($status);
        }
        unset($i);

        return $statuses;
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

    private function array_unique_nested(array $array, string $uniqueKey): array
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
