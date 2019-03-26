<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\Category;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\ContactForm;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProgressStep;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalSelectionVote;
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
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\ConsultationStepType;
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
use Capco\AppBundle\Entity\ProjectType;
use Capco\ClassificationBundle\Entity\Context;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\Id\AssignedGenerator;
use Doctrine\ORM\Mapping\ClassMetadata;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class LoadProdDataCommand extends ContainerAwareCommand
{
    private $env;

    private $doctrine;

    public function __construct(string $name, ManagerRegistry $managerRegistry)
    {
        parent::__construct($name);

        $this->doctrine = $managerRegistry;
    }

    protected function configure()
    {
        $this->setName('capco:load-prod-data')
            ->setDescription('A bunch of fixtures to start using the application')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the rebuild'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln(
                'This command will add some demo data in your project, if you\'re sure that you want those data, go ahead and add --force'
            );
            $output->writeln('Please set the --force option to run this command');

            return;
        }
        $this->env = $input->getOption('env');

        $this->loadFixtures($output, $input->getOption('env'));
        $this->loadToggles($output);

        $output->writeln('Load prod data completed');
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
            ConsultationStepType::class,
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
            MultipleChoiceQuestion::class,
            MediaQuestion::class,
            SectionQuestion::class,
            QuestionChoice::class,
            UserArchive::class,
            Requirement::class,
            Reporting::class,
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
                'hautelook:fixtures:load' => ['-e' => $env],
            ],
            $output
        );

        $this->runCommands(
            [
                'hautelook:fixtures:load' => ['-e' => $env, '--append' => true],
            ],
            $output
        );
    }

    protected function loadToggles(OutputInterface $output)
    {
        $command = $this->getApplication()->find('capco:reset-feature-flags');
        $input = new ArrayInput([
            '--force' => true,
        ]);
        $input->setInteractive(false);
        $command->run($input, $output);
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
