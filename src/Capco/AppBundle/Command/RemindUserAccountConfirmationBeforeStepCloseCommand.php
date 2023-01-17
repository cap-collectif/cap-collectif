<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class RemindUserAccountConfirmationBeforeStepCloseCommand extends Command
{
    private AbstractStepRepository $stepRepository;
    private UserRepository $userRepository;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private RouterInterface $router;
    private Publisher $publisher;

    public function __construct(
        AbstractStepRepository $stepRepository,
        UserRepository $userRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        RouterInterface $router,
        Publisher $mailerService,
        ?string $name = null
    ) {
        parent::__construct($name);
        $this->stepRepository = $stepRepository;
        $this->userRepository = $userRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->router = $router;
        $this->publisher = $mailerService;
    }

    protected function configure()
    {
        $this->setName('capco:remind-user-account-confirmation-before-step-close')
            ->setDescription('Remind users by email to confirm their account before step close')
            ->addOption('date', null, InputOption::VALUE_OPTIONAL);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('Reminding users to confirm their email before steps ending :');

        $steps = $this->getSteps($output, $input);
        $users = $this->getUsersToConfirm($steps, $output);
        $this->addAnonymousArguments($steps, $users);

        $this->sendMessages($users, $output);
        $output->writeln(\count($users) . ' reminders sent !');

        return 0;
    }

    private function sendMessages(array $users, OutputInterface $output): void
    {
        foreach ($users as $user) {
            $message = new Message(json_encode($user));
            $this->publisher->publish(CapcoAppBundleMessagesTypes::USER_STEP_REMINDER, $message);
            $output->writeln('send reminder to ' . $user['email']);
        }
    }

    private function addAnonymousArguments(array $steps, array &$users): void
    {
        foreach ($steps as $step) {
            if ($step instanceof DebateStep) {
                foreach ($step->getDebate()->getAnonymousArguments() as $argument) {
                    if (
                        !$argument->isPublished() &&
                        !\array_key_exists($argument->getEmail(), $users)
                    ) {
                        $users[$argument->getEmail()] = [
                            'username' => $argument->getUsername() ?? '',
                            'email' => $argument->getEmail(),
                            'confirmationUrl' => $this->router->generate(
                                'capco_app_debate_publish_argument',
                                [
                                    'token' => $argument->getToken(),
                                    'stepId' => $step->getId(),
                                ],
                                UrlGeneratorInterface::ABSOLUTE_URL
                            ),
                            'projectTitle' => $step->getProject()->getTitle(),
                        ];
                    }
                }
            }
        }
    }

    private function getSteps(OutputInterface $output, InputInterface $input): array
    {
        $date = $this->getDate($input);
        $steps = $this->stepRepository->getStepEndingBetween(
            $this->getBeforeDate($date),
            $this->getAfterDate($date)
        );
        foreach ($steps as $step) {
            $output->writeln(
                $step->getTitle() . ' will end at ' . $step->getEndAt()->format('Y-m-d H:i:s')
            );
        }
        if (empty($steps)) {
            $output->writeln('No step ending between 49 and 48h.');
        }

        return $steps;
    }

    private function getUsersToConfirm(array $steps, OutputInterface $output): array
    {
        if (empty($steps)) {
            return [];
        }

        $users = $this->getUnconfirmedUsers($output);
        if (empty($users)) {
            return [];
        }

        $usersToConfirm = self::filterUsersWithUnpublishedContributions($users, $steps);
        $output->writeln(\count($usersToConfirm) . ' have unpublished contribution in ending step');

        return $usersToConfirm;
    }

    private function getUnconfirmedUsers(OutputInterface $output): array
    {
        $users = $this->userRepository->getUnconfirmedUsers();
        $output->writeln(\count($users) . ' unconfirmed users');

        return $users;
    }

    private function filterUsersWithUnpublishedContributions(array $users, array $steps): array
    {
        $filteredUsers = [];
        $filteredOut = [];
        foreach ($users as $user) {
            if (
                \array_key_exists($user->getUsername(), $filteredUsers) ||
                \array_key_exists($user->getUsername(), $filteredOut)
            ) {
                break;
            }
            if ($step = $this->hasUserUnpublishedContributionsInAnyStep($user, $steps)) {
                $filteredUsers[$user->getEmail()] = [
                    'username' => $user->getUsername() ?? '',
                    'email' => $user->getEmail(),
                    'confirmationUrl' => $this->router->generate(
                        'account_confirm_email_step',
                        [
                            'token' => $user->getConfirmationToken(),
                            'stepId' => $step->getId(),
                        ],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    ),
                    'projectTitle' => $step->getProject()->getTitle(),
                ];
            } else {
                $filteredOut[$user->getEmail()] = $user->getEmail();
            }
        }

        return $filteredUsers;
    }

    private function hasUserUnpublishedContributionsInAnyStep(
        User $user,
        iterable $steps
    ): ?AbstractStep {
        foreach ($steps as $step) {
            if ($step->isParticipative()) {
                foreach ($user->getContributions() as $contribution) {
                    if (
                        $contribution instanceof Publishable &&
                        !$contribution->isPublished() &&
                        $contribution->getStep() === $step &&
                        !$this->isVoteMissingMinimalNumber($contribution, $step, $user)
                    ) {
                        return $step;
                    }
                }
            }
        }

        return null;
    }

    private function isVoteMissingMinimalNumber(
        Publishable $contribution,
        AbstractStep $step,
        User $user
    ): bool {
        return $contribution instanceof AbstractVote &&
            $step instanceof SelectionStep &&
            $step->getVotesMin() &&
            $this->proposalSelectionVoteRepository->getByAuthorAndStep($user, $step) <
                $step->getVotesMin();
    }

    private static function getDate(InputInterface $input): \DateTimeImmutable
    {
        try {
            return new \DateTimeImmutable($input->getOption('date'));
        } catch (\Exception $e) {
            throw new \RuntimeException('invalid date : ' . $input->getOption('date'));
        }
    }

    private static function getBeforeDate(\DateTimeImmutable $date): \DateTimeImmutable
    {
        return $date->modify('+48 hours');
    }

    private static function getAfterDate(\DateTimeImmutable $date): \DateTimeImmutable
    {
        return $date->modify('+49 hours');
    }
}
