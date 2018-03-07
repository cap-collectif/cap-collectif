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
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\EventListener\ReferenceEventListener;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Cocur\Slugify\Slugify;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
    protected const USERS_BATCH_SIZE = 100;
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

    protected const USER_HEADER = [
        'name',
        'firstname',
        'lastname',
        'user_type',
        'user_type_rattachement',
        'password',
        'email',
        'created_at',
        'last_login_at',
        'birthdate',
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

    protected const PROFILES_TYPES = [
        'p' => 'Un particulier',
        'a' => 'Un agent de la ville de Paris',
    ];

    protected const PROFILES_TYPES_RATTACHEMENT = [
        'Cabinet de la Maire',
        'Caisses des écoles',
        "CASVP : Centre d'Action social de la Ville de Paris",
        'DAC : Direction des Affaires culturelles',
        'DAJ : Direction des Affaires juridiques',
        'DASCO : Direction des Affaires scolaires',
        "DASES : Direction de l'Action sociale, de l'Enfance et de la Santé",
        'DDCT : Direction de la Démocratie, des Citoyens et des Territoires',
        "DDEEES : Direction du Développement économique , de l'Emploi et de l'Enseignement supérieur",
        "DEVE : Direction des Espaces verts et de l'Environnement",
        'DFA : Direction des Finances et des Achats',
        'DFPE : Direction des Familles et de la petite Enfance',
        "DICOM : Direction de l'Information et de la Communication",
        "DILT : Direction de l'Immobilier, de la Logistique et des Transports",
        'DJS : Direction de la Jeunesse et des Sports',
        "DLH : Direction du Logement et de l'Habitat",
        "DPA : Direction du Patrimoine et de l'Architecture",
        "DPE : Direction de la Propreté et de l'Eau",
        'DPP : Direction de la Prévention et de la Protection',
        'DRH : Direction des Ressources humaines',
        "DSTI : Direction des Systèmes et Technologies de l'Information",
        "DU : Direction de l'Urbanisme",
        'DVD : Direction de la Voirie et des Déplacements',
        'EPM : Paris Musées',
        'IG : Inspection générale',
        'SGVP : Secrétariat général de la Ville de Paris',
        "SG_Hors budget d'investissement",
        'SG_Hors compétence Ville',
        'SG_Projet existant ou prévu',
        'SG_Projet Imprécis',
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

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em->getConnection()->getConfiguration()->setSQLLogger(null);
        $this->users = $this->createUsers();
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

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $stopwatch = new Stopwatch();
        $stopwatch->start('import');
        $this->importUsers($output);
        $this->importProjects($output);
        $event = $stopwatch->stop('import');
        $output->writeln("\n<info>Elapsed time : " . $event->getDuration() / 1000000 . " minutes. \n Memory usage : " . $event->getMemory() / 1000000 . ' MB</info>');
    }

    protected function importUsers(OutputInterface $output): void
    {
        $output->writeln('<info>Importing users...</info>');
        $count = 1;
        $progress = new ProgressBar($output, \count($this->users));
        $types = $this->createUsersTypes($output);
        foreach ($this->users as $user) {
            $type = $types->filter(function (UserType $type) use ($user) {
                if (!$user['user_type'] || 'p' === $user['user_type']) {
                    return 'Un particulier' === $type->getName();
                }
                if ($user['user_type_rattachement']) {
                    return $type->getName() === $user['user_type_rattachement'];
                }

                return $type->getName() === self::PROFILES_TYPES[$user['user_type']];
            })->first();
            $user = (new User())
                ->setFirstname('' !== $user['firstname'] ? $user['firstname'] : null)
                ->setLastname('' !== $user['lastname'] ? $user['lastname'] : null)
                ->setPassword('')
                ->setUserType($type)
                ->setEmail($user['email'])
                ->setParisId($user['email'])
                ->setCreatedAt(new \DateTime($user['created_at']))
                ->setLastLogin(new \DateTime($user['last_login_at']))
                ->setDateOfBirth(new \DateTime($user['birthdate']));
            $this->em->persist($user);
            if (0 === $count % self::USERS_BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear(User::class);
                $this->em->clear(UserNotificationsConfiguration::class);
                $this->printMemoryUsage($output);
            }
            $progress->advance();
            ++$count;
        }
        unset($count);
        $this->em->flush();
        $this->em->clear(User::class);
        $this->em->clear(UserNotificationsConfiguration::class);
        $progress->finish();
        $output->writeln('<info>Successfully imported users...</info>');
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
        $output->writeln("\n<info>Successfully imported " . \count($this->projects) . ' projects.</info>');
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
        $output->writeln('<info>Successfully imported districts.</info>');
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
                $status = $statuses->filter(function (Status $status) use ($proposal) {
                    return false !== stripos(
                            Slugify::create()->slugify($status->getName()),
                            $proposal['status']
                        );
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
                    ->setStatus($status)
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
            $output->writeln("\n<info>Successfully imported proposals.</info>");
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
            $output->writeln("\n<info>Successfully imported comments for proposal.</info>");
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

        $output->writeln('<info>Successfully added "' . $formName . '" form.</info>');

        return $proposalForm;
    }

    protected function createUsers(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_users.csv');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::USER_HEADER);
        $users = [];
        foreach ($iterator as $item) {
            $users[] = $item;
        }

        return $users;
    }

    protected function createUsersTypes(OutputInterface $output): Collection
    {
        $output->writeln('<info>Creating user types...</info>');
        foreach (self::PROFILES_TYPES as $key => $value) {
            $type = (new UserType())
                ->setName($value);
            $this->em->persist($type);
        }
        foreach (self::PROFILES_TYPES_RATTACHEMENT as $agentName) {
            $type = (new UserType())
                ->setName($agentName);
            $this->em->persist($type);
        }
        $this->em->flush();
        $this->em->clear();
        $output->writeln('<info>User types created successfully.</info>');

        return new ArrayCollection($this->em->getRepository(UserType::class)->findAll());
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
