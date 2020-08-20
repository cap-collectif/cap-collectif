<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Theme;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\MediaBundle\Entity\Media;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Reporting;
use Capco\UserBundle\Entity\UserType;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Entity\UserInvite;
use Doctrine\DBAL\ConnectionException;
use Doctrine\ORM\Id\AssignedGenerator;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\UserArchive;
use Doctrine\ORM\Mapping\ClassMetadata;
use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\ProgressStep;
use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\Persistence\ManagerRegistry;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\SourceCategory;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\RegistrationForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Styles\BorderStyle;
use Capco\ClassificationBundle\Entity\Context;
use Symfony\Component\Console\Command\Command;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputOption;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Styles\BackgroundStyle;
use Capco\AppBundle\Entity\ContactForm\ContactForm;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\Controller\Api\MediasController;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\EventListener\UserInviteListener;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\EventListener\ReferenceEventListener;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\DataFixtures\Processor\ProgressBarProcessor;
use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepVotesCountDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepContributionsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Project\ProjectProposalsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;

class ReinitCommand extends Command
{
    public const ENTITIES_WITH_LISTENERS = [UserInvite::class];
    public const LISTENERS_TO_DISABLE = [UserInviteListener::class];
    private $env;
    private $doctrine;
    private $em;
    private $eventManager;
    private $progressBarProcessor;
    private $elasticsearchListener;
    private $publishableListener;
    private $referenceListener;
    private $stepContributionDataloader;
    private $proposalFormProposalsDataloader;
    private $collectStepContributorsDataloader;
    private $stepVotesCountDataloader;
    private $projectProposalsDataloader;
    private $projectCurrentVotableStepDataloader;
    private $stopwatch;

    public function __construct(
        string $name,
        ManagerRegistry $managerRegistry,
        EntityManagerInterface $em,
        ProgressBarProcessor $progressBarProcessor,
        DoctrineListener $publishableListener,
        ElasticsearchDoctrineListener $elasticsearchListener,
        ReferenceEventListener $referenceListener,
        StepContributionsDataLoader $stepContributionDataloader,
        ProposalFormProposalsDataLoader $proposalFormProposalsDataloader,
        CollectStepContributorCountDataLoader $collectStepContributorsDataloader,
        StepVotesCountDataLoader $stepVotesCountDataloader,
        ProjectProposalsDataLoader $projectProposalsDataloader,
        ProposalCurrentVotableStepDataLoader $projectCurrentVotableStepDataloader,
        Stopwatch $stopwatch
    ) {
        parent::__construct($name);

        $this->doctrine = $managerRegistry;
        $this->em = $em;
        $this->eventManager = $em->getEventManager();
        $this->progressBarProcessor = $progressBarProcessor;
        $this->publishableListener = $publishableListener;
        $this->elasticsearchListener = $elasticsearchListener;
        $this->stepContributionDataloader = $stepContributionDataloader;
        $this->proposalFormProposalsDataloader = $proposalFormProposalsDataloader;
        $this->collectStepContributorsDataloader = $collectStepContributorsDataloader;
        $this->stepVotesCountDataloader = $stepVotesCountDataloader;
        $this->projectProposalsDataloader = $projectProposalsDataloader;
        $this->projectCurrentVotableStepDataloader = $projectCurrentVotableStepDataloader;
        $this->referenceListener = $referenceListener;
        $this->stopwatch = $stopwatch;
    }

    protected function configure()
    {
        $this->setName('capco:reinit')
            ->setDescription('Reinit the application data')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the rebuild'
            )
            ->addOption(
                'migrate',
                false,
                InputOption::VALUE_NONE,
                'set this option to execute the migrations instead of creating schema'
            )
            ->addOption(
                'no-toggles',
                false,
                InputOption::VALUE_NONE,
                'set this option to skip reseting feature flags'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln('Please set the --force option to run this command');

            return 1;
        }

        $this->stopwatch->start('reinit');

        $this->progressBarProcessor->setOutput($output);

        $this->env = $input->getOption('env');

        $output->writeln('Droping database…');

        try {
            $this->dropDatabase($output);
        } catch (ConnectionException $e) {
            $output->writeln(
                '<error>Database could not be deleted - maybe it didn\'t exist?</error>'
            );
        }

        $output->writeln('<info>Database is cleared !</info>');
        $output->writeln('Disable event listeners…');

        $listeners = [
            $this->elasticsearchListener,
            $this->publishableListener,
            // $this->referenceListener,
        ];

        foreach ($listeners as $listener) {
            $this->eventManager->removeEventListener($listener->getSubscribedEvents(), $listener);
            $output->writeln('Disabled <info>' . \get_class($listener) . '</info>.');
        }

        foreach (self::ENTITIES_WITH_LISTENERS as $entity) {
            $metadata = $this->em->getMetadataFactory()->getMetadataFor($entity);

            foreach ($metadata->entityListeners as $event => $listeners) {
                foreach ($listeners as $key => $listener) {
                    if (\in_array($listener['class'], self::LISTENERS_TO_DISABLE)) {
                        unset($listeners[$key]);
                        $output->writeln('Disabled <info>' . $listener['class'] . '</info>.');
                    }
                }
                $metadata->entityListeners[$event] = $listeners;
            }
            $this->em->getMetadataFactory()->setMetadataFor($entity, $metadata);
        }

        $output->writeln('Disable dataloader\'s cache…');

        // Disable some dataloader cache
        $dataloaders = [
            $this->stepContributionDataloader,
            $this->proposalFormProposalsDataloader,
            $this->collectStepContributorsDataloader,
            $this->stepVotesCountDataloader,
            $this->projectProposalsDataloader,
            $this->projectCurrentVotableStepDataloader,
        ];
        foreach ($dataloaders as $dl) {
            $dl->disableCache();
            $output->writeln('Disabled <info>' . \get_class($dl) . '</info>.');
        }

        $this->createDatabase($output);
        if ($input->getOption('migrate')) {
            $this->executeMigrations($output);
        } else {
            $this->createSchema($output);
            $this->mockMigrations($output);
        }

        $this->loadFixtures($output, $this->env);
        $output->writeln('<info>Database is ready !</info>');

        if (!$input->getOption('no-toggles')) {
            $this->loadToggles($output);
        }
        $output->writeln('<info>Redis is ready !</info>');

        $this->em->clear();

        $this->recalculateCounters($output);

        $output->writeln('<info>Database counters are ready !</info>');

        $this->populateElasticsearch($output);

        $output->writeln('<info>Elasticsearch is ready !</info>');

        $this->em->clear();

        $this->updateSyntheses($output);

        $output->writeln('<info>Synthesis updated !</info>');

        $event = $this->stopwatch->stop('reinit');
        $output->writeln(
            'Total command duration: <info>' .
                floor($event->getDuration() / 1000) .
                '</info>s. ' .
                MediasController::formatBytes($event->getMemory()) .
                '.'
        );

        return 0;
    }

    protected function createDatabase(OutputInterface $output)
    {
        $this->stopwatch->start('createDatabase');
        $this->runCommands(
            [
                'doctrine:database:create' => [],
            ],
            $output
        );
        $event = $this->stopwatch->stop('createDatabase');
        $output->writeln(
            'Creating database duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    protected function createSchema(OutputInterface $output)
    {
        $this->stopwatch->start('createSchema');
        $this->runCommands(
            [
                'doctrine:schema:create' => [],
            ],
            $output
        );
        $event = $this->stopwatch->stop('createSchema');
        $output->writeln(
            'Creating database schema duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    protected function dropDatabase(OutputInterface $output)
    {
        $this->stopwatch->start('dropDatabase');
        $this->runCommands(
            [
                'doctrine:database:drop' => ['--force' => true],
            ],
            $output
        );
        $event = $this->stopwatch->stop('dropDatabase');
        $output->writeln(
            'Dropping database duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    protected function loadFixtures(OutputInterface $output, $env = 'dev')
    {
        $this->stopwatch->start('loadFixtures');

        $this->setDefaultLocale($output);

        $classesDev = [
            Media::class,
            Argument::class,
            RegistrationForm::class,
            User::class,
            UserType::class,
            CollectStep::class,
            SelectionStep::class,
            ProposalForm::class,
            Questionnaire::class,
            OpinionVersion::class,
            ProposalDistrict::class,
            Status::class,
            ProposalCategory::class,
            SourceCategory::class,
            Proposal::class,
            Opinion::class,
            Reply::class,
            ProjectAbstractStep::class,
            Project::class,
            QuestionnaireStep::class,
            OtherStep::class,
            Consultation::class,
            ConsultationStep::class,
            Comment::class,
            ProposalComment::class,
            EventComment::class,
            ProjectDistrict::class,
            RankingStep::class,
            PresentationStep::class,
            Group::class,
            Theme::class,
            Source::class,
            SimpleQuestion::class,
            CommentVote::class,
            MultipleChoiceQuestion::class,
            MediaQuestion::class,
            SectionQuestion::class,
            QuestionChoice::class,
            UserArchive::class,
            Requirement::class,
            Reporting::class,
            OpinionVote::class,
            OpinionVersionVote::class,
            SourceVote::class,
            ProposalSelectionVote::class,
            ProposalCollectVote::class,
            ProjectType::class,
            ProgressStep::class,
            PostComment::class,
            OpinionType::class,
            OpinionAppendix::class,
            MultipleChoiceQuestionLogicJumpCondition::class,
            MapToken::class,
            LogicJump::class,
            Event::class,
            ContactForm::class,
            BorderStyle::class,
            BackgroundStyle::class,
            ArgumentVote::class,
            AppendixType::class,
            Post::class,
            UserInvite::class,
        ];

        $classesProd = [Context::class];
        $classes = 'prod' === $env ? $classesProd : $classesDev;
        foreach ($classes as $class) {
            /** @var ClassMetadata $metadata */
            $metadata = $this->doctrine->getManager()->getClassMetaData($class);
            $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);
            $metadata->setIdGenerator(new AssignedGenerator());
        }

        $this->runCommands(
            [
                'hautelook:fixtures:load' => [
                    '-e' => $env,
                    '--append' => true,
                    '--no-bundles' => true,
                ],
            ],
            $output
        );

        $this->translateBaseParameters($output);

        $this->progressBarProcessor->finish();

        $event = $this->stopwatch->stop('loadFixtures');
        $output->writeln(
            'Loading fixtures duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    protected function loadToggles(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:reset-feature-flags' => [
                    '--force' => true,
                    '--env' => $this->env,
                ],
            ],
            $output
        );
    }

    protected function recalculateCounters(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:compute:users-counters' => ['--env' => $this->env, '--force' => true],
                'capco:compute:counters' => ['--env' => $this->env, '--force' => true],
            ],
            $output
        );
    }

    protected function updateSyntheses(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:syntheses:update' => [],
                'capco:syntheses:fix-urls' => [],
                'capco:syntheses:counters' => [],
            ],
            $output
        );
    }

    protected function populateElasticsearch(OutputInterface $output)
    {
        $this->stopwatch->start('populate');

        $this->runCommands(
            [
                'capco:es:clean' => ['--all' => true, '--no-debug' => true],
            ],
            $output
        );
        // /!\ Do not use create --populate
        // Because for correct counters value we need to query ES
        $this->runCommands(
            [
                'capco:es:create' => ['--quiet' => true, '--no-debug' => true],
            ],
            $output
        );
        $this->runCommands(
            [
                'capco:es:populate' => ['--quiet' => true, '--no-debug' => true],
            ],
            $output
        );

        $event = $this->stopwatch->stop('populate');
        $output->writeln(
            'Populate Elasticsearch duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    protected function executeMigrations(OutputInterface $output)
    {
        $this->stopwatch->start('executeMigrations');

        $this->runCommands(
            [
                'doctrine:migration:migrate' => ['--no-interaction' => true],
            ],
            $output
        );

        $event = $this->stopwatch->stop('executeMigrations');
        $output->writeln(
            'Adding migrations duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    protected function mockMigrations(OutputInterface $output)
    {
        $this->stopwatch->start('mockMigrations');

        $this->runCommands(
            [
                'doctrine:migration:version' => [
                    '--add' => true,
                    '--all' => true,
                    '--quiet' => true,
                    '--no-debug' => true,
                ],
            ],
            $output
        );

        $event = $this->stopwatch->stop('mockMigrations');
        $output->writeln(
            'Mocking migrations duration: <info>' . $event->getDuration() / 1000 . '</info>s'
        );
    }

    private function setDefaultLocale(OutputInterface $output): void
    {
        $this->runCommands(
            [
                'capco:reset:default-locale' => [
                    '--code' => 'fr-FR',
                    '--locale' => 'french',
                ],
            ],
            $output
        );
    }

    private function translateBaseParameters(OutputInterface $output): void
    {
        $this->runCommands(
            [
                'capco:reset:translate-parameters' => [
                    '--defaultLocale' => 'fr-FR',
                ],
            ],
            $output
        );
    }

    private function runCommands(array $commands, $output)
    {
        foreach ($commands as $key => $value) {
            $input = new ArrayInput($value);
            $input->setInteractive(false);
            $this->getApplication()
                ->find($key)
                ->run($input, $output);
        }
    }
}
