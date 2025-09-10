<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\DataFixtures\Processor\ProgressBarProcessor;
use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\ContactForm\ContactForm;
use Capco\AppBundle\Entity\Context;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProgressStep;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\ProposalSocialNetworks;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\RegistrationForm;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SourceCategory;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Styles\BackgroundStyle;
use Capco\AppBundle\Entity\Styles\BorderStyle;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\EventListener\DebateArticleListener;
use Capco\AppBundle\EventListener\QuestionnaireSubscriber;
use Capco\AppBundle\EventListener\UserInviteEmailMessageListener;
use Capco\AppBundle\GraphQL\DataLoader\Project\ProjectProposalsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepContributionsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepPointsVotesCountDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepVotesCountDataLoader;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Doctrine\Common\EventManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\AssignedGenerator;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Mapping\ClassMetadataInfo;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\Mapping\MappingException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Exception\ExceptionInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

#[AsCommand(
    name: 'capco:reinit',
    description: 'Reinit the application data',
)]
class ReinitCommand extends Command
{
    final public const ENTITIES_WITH_LISTENERS = [
        UserInvite::class,
        DebateArticle::class,
        UserInviteEmailMessage::class,
    ];
    final public const LISTENERS_TO_DISABLE = [
        UserInviteEmailMessageListener::class,
        DebateArticleListener::class,
    ];
    private string $env;
    private readonly EventManager $eventManager;

    private SymfonyStyle $io;

    public function __construct(
        private readonly ManagerRegistry $doctrine,
        private readonly EntityManagerInterface $em,
        private readonly ProgressBarProcessor $progressBarProcessor,
        private readonly DoctrineListener $publishableListener,
        private readonly ElasticsearchDoctrineListener $elasticsearchListener,
        private readonly QuestionnaireSubscriber $questionnaireSubscriber,
        private readonly StepContributionsDataLoader $stepContributionDataloader,
        private readonly ProposalFormProposalsDataLoader $proposalFormProposalsDataloader,
        private readonly CollectStepContributorCountDataLoader $collectStepContributorsDataloader,
        private readonly StepVotesCountDataLoader $stepVotesCountDataloader,
        private readonly StepPointsVotesCountDataLoader $stepPointsVotesCountDataLoader,
        private readonly ProjectProposalsDataLoader $projectProposalsDataloader,
        private readonly ProposalCurrentVotableStepDataLoader $projectCurrentVotableStepDataloader,
        private readonly Stopwatch $stopwatch,
        ?string $name = null,
    ) {
        parent::__construct($name);
        $this->eventManager = $this->em->getEventManager();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                'set this option to force the rebuild'
            )
            ->addOption(
                'migrate',
                null,
                InputOption::VALUE_NONE,
                'set this option to execute the migrations instead of creating schema'
            )
            ->addOption(
                'no-toggles',
                null,
                InputOption::VALUE_NONE,
                'set this option to skip reseting feature flags'
            )
        ;
    }

    /**
     * @throws MappingException
     * @throws ExceptionInterface
     * @throws \ReflectionException
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->io = new SymfonyStyle($input, $output);

        if (!$input->getOption('force')) {
            $this->io->error('Please set the --force option to run this command');

            return Command::FAILURE;
        }

        $this->stopwatch->start('reinit');

        $this->progressBarProcessor->setOutput($output);

        $this->env = $input->getOption('env');

        $this->io->info('Droping database...');

        try {
            $this->dropDatabase($output);
        } catch (\Throwable $e) {
            $this->io->error('Database could not be deleted: ' . $e->getMessage());
        }

        $this->io->info('Database is cleared !');
        $this->io->info('Disable event listeners…');

        $listeners = [
            $this->elasticsearchListener,
            $this->publishableListener,
            $this->questionnaireSubscriber,
        ];

        foreach ($listeners as $listener) {
            $this->eventManager->removeEventListener($listener->getSubscribedEvents(), $listener);
            $this->io->writeln(sprintf('Disabled %s.', $listener::class));
        }

        foreach (self::ENTITIES_WITH_LISTENERS as $entity) {
            $metadata = $this->em->getMetadataFactory()->getMetadataFor($entity);

            foreach ($metadata->entityListeners as $event => $listeners) {
                foreach ($listeners as $key => $listener) {
                    if (\in_array($listener['class'], self::LISTENERS_TO_DISABLE)) {
                        unset($listeners[$key]);
                        $this->io->writeln(sprintf('Disabled %s.', $listener['class']));
                    }
                }
                $metadata->entityListeners[$event] = $listeners;
            }
            $this->em->getMetadataFactory()->setMetadataFor($entity, $metadata);
        }

        $this->io->info("Disable dataloader's cache…");

        // Disable some dataloader cache
        $dataloaders = [
            $this->stepContributionDataloader,
            $this->proposalFormProposalsDataloader,
            $this->collectStepContributorsDataloader,
            $this->stepVotesCountDataloader,
            $this->stepPointsVotesCountDataLoader,
            $this->projectProposalsDataloader,
            $this->projectCurrentVotableStepDataloader,
        ];
        foreach ($dataloaders as $dl) {
            $dl->disableCache();
            $this->io->writeln(sprintf('Disabled %s.', $dl::class));
        }

        $this->createDatabase($output);
        if ($input->getOption('migrate')) {
            $this->executeMigrations($output);
        } else {
            $this->createSchema($output);
            $this->mockMigrations($output);
        }

        $this->loadFixtures($output, $this->env);

        if ('prod' === $this->env) {
            $this->io->info('Start generate map token');

            $this->runCommands(['capco:generate:map-token' => ['provider' => 'MAPBOX']], $output);
            $this->io->info('End generate map token');
        }

        $this->io->info('Database is ready!');

        if (!$input->getOption('no-toggles')) {
            $this->loadToggles($output);
        }
        $this->io->info('Redis is ready!');
        $this->em->clear();

        $this->recalculateCounters($output);

        $this->io->info('Database counters are ready!');

        $this->populateElasticsearch($output);

        $this->io->info('Elasticsearch is ready!');

        $event = $this->stopwatch->stop('reinit');
        $this->io->info(
            sprintf(
                'Total command duration: %ss. %s',
                floor($event->getDuration() / 1000),
                MediaManager::formatBytes($event->getMemory())
            )
        );

        return Command::SUCCESS;
    }

    /**
     * @throws ExceptionInterface
     */
    protected function createDatabase(OutputInterface $output): void
    {
        $this->stopwatch->start('createDatabase');
        $this->runCommands(
            [
                'doctrine:database:create' => [],
                'doctrine:migration:sync-metadata-storage' => [],
            ],
            $output
        );
        $event = $this->stopwatch->stop('createDatabase');
        $this->io->info(sprintf('Creating database duration: %ss', $event->getDuration() / 1000));
    }

    /**
     * @throws ExceptionInterface
     */
    protected function createSchema(OutputInterface $output): void
    {
        $this->stopwatch->start('createSchema');
        $this->runCommands(
            [
                'doctrine:schema:create' => [],
            ],
            $output
        );
        $event = $this->stopwatch->stop('createSchema');
        $this->io->info(sprintf('Creating database schema duration: %s.', $event->getDuration() / 1000));
    }

    /**
     * @throws ExceptionInterface
     */
    protected function dropDatabase(OutputInterface $output): void
    {
        $this->stopwatch->start('dropDatabase');
        $this->runCommands(
            [
                'doctrine:database:drop' => ['--if-exists' => true, '--force' => true],
            ],
            $output
        );
        $event = $this->stopwatch->stop('dropDatabase');
        $this->io->info(sprintf('Dropping database duration: %s', $event->getDuration() / 1000));
    }

    /**
     * @throws ExceptionInterface
     */
    protected function loadFixtures(OutputInterface $output, string $env = 'dev'): void
    {
        $this->stopwatch->start('loadFixtures');

        $this->setDefaultLocale($output);

        $classesDev = [
            Media::class,
            Argument::class,
            RegistrationForm::class,
            User::class,
            UserType::class,
            Debate::class,
            DebateVote::class,
            DebateOpinion::class,
            DebateArgument::class,
            DebateArgumentVote::class,
            DebateStep::class,
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
            GlobalDistrict::class,
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
            UserInviteEmailMessage::class,
            ProposalAnalysis::class,
            ProposalAssessment::class,
            ProposalDecision::class,
            ProposalSocialNetworks::class,
        ];

        $classesProd = [Context::class];
        $classes = 'prod' === $env ? $classesProd : $classesDev;
        foreach ($classes as $class) {
            /** @var ClassMetadata $metadata */
            $metadata = $this->doctrine->getManager()->getClassMetaData($class);
            $metadata->setIdGeneratorType(ClassMetadataInfo::GENERATOR_TYPE_NONE);
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
        $this->io->info(sprintf('Loading fixtures duration: %s.', $event->getDuration() / 1000));
    }

    /**
     * @throws ExceptionInterface
     */
    protected function loadToggles(OutputInterface $output): void
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

    /**
     * @throws ExceptionInterface
     */
    protected function recalculateCounters(OutputInterface $output): void
    {
        $this->runCommands(
            [
                'capco:compute:users-counters' => ['--env' => $this->env, '--force' => true],
            ],
            $output
        );
    }

    /**
     * @throws ExceptionInterface
     */
    protected function populateElasticsearch(OutputInterface $output): void
    {
        // /!\ Do not use create --populate
        // Because for correct counters value we need to query ES
        $this->runCommands(
            [
                'capco:es:clean' => ['--all' => true, '--no-debug' => true],
                'capco:es:create' => ['--quiet' => true, '--no-debug' => true],
                'capco:es:populate' => ['--quiet' => true, '--no-debug' => true],
                'capco:es:create-analytics-test-index' => ['--quiet' => true, '--no-debug' => true],
            ],
            $output
        );
    }

    /**
     * @throws ExceptionInterface
     */
    protected function executeMigrations(OutputInterface $output): void
    {
        $this->stopwatch->start('executeMigrations');

        $this->runCommands(
            [
                'doctrine:migration:migrate' => ['--no-interaction' => true],
            ],
            $output
        );

        $event = $this->stopwatch->stop('executeMigrations');
        $this->io->info(sprintf('Adding migrations duration: %s.', $event->getDuration() / 1000));
    }

    /**
     * @throws ExceptionInterface
     */
    protected function mockMigrations(OutputInterface $output): void
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
        $this->io->info(sprintf('Mocking migrations duration: %s.', $event->getDuration() / 1000));
    }

    /**
     * @throws ExceptionInterface
     */
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

    /**
     * @throws ExceptionInterface
     */
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

    /**
     * @throws ExceptionInterface
     */
    private function runCommands(array $commands, mixed $output): void
    {
        foreach ($commands as $key => $value) {
            $input = new ArrayInput($value);
            $input->setInteractive(false);
            $returnCode = $this->getApplication()
                ->find($key)
                ->run($input, $output)
            ;

            if (Command::SUCCESS !== $returnCode) {
                throw new \RuntimeException('Command' . $key . 'failed…', Command::FAILURE);
            }
        }
    }
}
