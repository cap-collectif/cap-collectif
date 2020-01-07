<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Joli\JoliNotif\Notification;
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
use Joli\JoliNotif\NotifierFactory;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Category;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Reporting;
use Capco\UserBundle\Entity\UserType;
use Capco\AppBundle\Entity\SourceVote;
use Doctrine\DBAL\ConnectionException;
use Doctrine\ORM\Id\AssignedGenerator;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\ContactForm;
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
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\RegistrationForm;
use Doctrine\Persistence\ManagerRegistry;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Styles\BorderStyle;
use Capco\ClassificationBundle\Entity\Context;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputOption;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Styles\BackgroundStyle;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepVotesCountDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepContributionsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ReinitCommand extends Command
{
    private $env;
    private $doctrine;
    private $em;
    private $container;

    public function __construct(
        string $name,
        ManagerRegistry $managerRegistry,
        EntityManagerInterface $em,
        ContainerInterface $container
    ) {
        parent::__construct($name);

        $this->doctrine = $managerRegistry;
        $this->em = $em;
        $this->container = $container;
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

            return;
        }

        $this->env = $input->getOption('env');

        $notifier = NotifierFactory::create();

        try {
            $this->dropDatabase($output);
        } catch (ConnectionException $e) {
            $output->writeln(
                '<error>Database could not be deleted - maybe it didn\'t exist?</error>'
            );
        }

        $eventManager = $this->container
            ->get('doctrine')
            ->getManager()
            ->getEventManager();
        $elasticsearchListener = $this->container->get(ElasticsearchDoctrineListener::class);
        $publishableListener = $this->container->get(DoctrineListener::class);

        $eventManager->removeEventListener(
            $elasticsearchListener->getSubscribedEvents(),
            $elasticsearchListener
        );
        $output->writeln('Disabled <info>' . \get_class($elasticsearchListener) . '</info>.');

        $eventManager->removeEventListener(
            $publishableListener->getSubscribedEvents(),
            $publishableListener
        );
        $output->writeln('Disabled <info>' . \get_class($publishableListener) . '</info>.');

        // Disable some dataloader cache
        $stepContributions = $this->container->get(StepContributionsDataLoader::class);
        $stepContributions->disableCache();
        $proposalFormProposals = $this->container->get(ProposalFormProposalsDataLoader::class);
        $proposalFormProposals->disableCache();
        $collectStepContributionsCount = $this->container->get(
            CollectStepContributorCountDataLoader::class
        );
        $collectStepContributionsCount->disableCache();
        $stepVotesCount = $this->container->get(StepVotesCountDataLoader::class);
        $stepVotesCount->disableCache();

        $output->writeln('Disabled <info>' . \get_class($stepContributions) . '</info>.');
        $output->writeln('Disabled <info>' . \get_class($proposalFormProposals) . '</info>.');
        $output->writeln(
            'Disabled <info>' . \get_class($collectStepContributionsCount) . '</info>.'
        );
        $output->writeln('Disabled <info>' . \get_class($stepVotesCount) . '</info>.');

        $this->createDatabase($output);
        if ($input->getOption('migrate')) {
            $this->executeMigrations($output);
        } else {
            $this->createSchema($output);
            $this->mockMigrations($output);
        }
        $this->loadFixtures($output, $this->env);
        if (!$input->getOption('no-toggles')) {
            $this->loadToggles($output);
        }
        $output->writeln('<info>Database loaded !</info>');

        $this->container
            ->get('doctrine')
            ->getManager()
            ->clear();

        $this->recalculateCounters($output);

        $output->writeln('<info>Counters updated !</info>');

        $this->populateElasticsearch($output);

        $this->container
            ->get('doctrine')
            ->getManager()
            ->clear();

        $this->updateSyntheses($output);

        $output->writeln('<info>Synthesis updated !</info>');

        if ($notifier) {
            $notifier->send(
                (new Notification())->setTitle('Success')->setBody('Database reseted.')
            );
        }
    }

    protected function createDatabase(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:database:create' => []
            ],
            $output
        );
    }

    protected function createSchema(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:schema:create' => []
            ],
            $output
        );
    }

    protected function dropDatabase(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:database:drop' => ['--force' => true]
            ],
            $output
        );
        $connection = $this->container->get('doctrine')->getConnection();

        if ($connection->isConnected()) {
            $connection->close();
            $output->writeln('<info>previous connection closed</info>');
        }
    }

    protected function loadFixtures(OutputInterface $output, $env = 'dev')
    {
        $manager = $this->doctrine->getManager();
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
            Category::class,
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
            Post::class
        ];

        $classesProd = [Context::class];
        $classes = 'prod' === $env ? $classesProd : $classesDev;
        foreach ($classes as $class) {
            /** @var ClassMetadata $metadata */
            $metadata = $manager->getClassMetaData($class);
            $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);
            $metadata->setIdGenerator(new AssignedGenerator());
        }
        $this->runCommands(
            [
                'hautelook:fixtures:load' => ['-e' => $env]
            ],
            $output
        );
    }

    protected function loadToggles(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:reset-feature-flags' => [
                    '--force' => true,
                    '--env' => $this->env
                ]
            ],
            $output
        );
    }

    protected function recalculateCounters(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:compute:users-counters' => ['--env' => $this->env, '--force' => true],
                'capco:compute:counters' => ['--env' => $this->env, '--force' => true]
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
                'capco:syntheses:counters' => []
            ],
            $output
        );
    }

    protected function populateElasticsearch(OutputInterface $output)
    {
        $this->runCommands(
            [
                'capco:es:clean' => ['--all' => true, '--no-debug' => true]
            ],
            $output
        );
        // /!\ Do not use create --populate
        // Because for correct counters value we need to query ES
        $this->runCommands(
            [
                'capco:es:create' => ['--quiet' => true, '--no-debug' => true]
            ],
            $output
        );
        $this->runCommands(
            [
                'capco:es:populate' => ['--quiet' => true, '--no-debug' => true]
            ],
            $output
        );
    }

    protected function executeMigrations(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:migration:migrate' => ['--no-interaction' => true]
            ],
            $output
        );
    }

    protected function mockMigrations(OutputInterface $output)
    {
        $this->runCommands(
            [
                'doctrine:migration:version' => ['--add' => true, '--all' => true]
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
