<?php

namespace Capco\AppBundle\Command\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\AppBundle\Notifier\DebateNotifier;
use Capco\AppBundle\Repository\Debate\DebateVoteTokenRepository;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Find id of a debate : SELECT debate.id, step.title FROM debate LEFT JOIN step ON step.id = step_id;.
 */
class DebateInvitationCommand extends Command
{
    public const NAME = 'capco:debate:invite';
    public const ARG_DEBATE = 'debate';
    public const OPT_REMINDER = 'reminder';
    public const OPT_TEST_TOKEN = 'test-token';
    public const OPT_TEST_EMAIL = 'test-email';
    public const OPT_BATCH = 'batch';
    public const OPT_BATCH_DEFAULT = 10;
    public const OPT_LIMIT = 'limit';

    private EntityManagerInterface $em;
    private UserRepository $userRepository;
    private DebateRepository $debateRepository;
    private DebateVoteTokenRepository $voteTokenRepository;
    private DebateNotifier $debateNotifier;

    public function __construct(
        ?string $name,
        EntityManagerInterface $em,
        UserRepository $userRepository,
        DebateRepository $debateRepository,
        DebateVoteTokenRepository $voteTokenRepository,
        DebateNotifier $debateNotifier
    ) {
        parent::__construct($name);
        $this->em = $em;
        $this->userRepository = $userRepository;
        $this->debateRepository = $debateRepository;
        $this->voteTokenRepository = $voteTokenRepository;
        $this->debateNotifier = $debateNotifier;
    }

    protected function configure()
    {
        $this->setName(self::NAME)
            ->setDescription('Send an email to all confirmed users who has not voted in debate')
            ->addArgument(self::ARG_DEBATE, InputArgument::REQUIRED, 'the id of the debate')
            ->addOption(
                self::OPT_REMINDER,
                'r',
                InputOption::VALUE_NONE,
                'the email shall be sent as a reminder'
            )
            ->addOption(
                self::OPT_BATCH,
                'b',
                InputOption::VALUE_OPTIONAL,
                'the amount of email to launch between each save',
                self::OPT_BATCH_DEFAULT
            )
            ->addOption(
                self::OPT_LIMIT,
                'l',
                InputOption::VALUE_OPTIONAL,
                'the limit of emails to be sent',
                null
            )
            ->addOption(
                self::OPT_TEST_TOKEN,
                null,
                InputOption::VALUE_NONE,
                '/!\ Should be used for CI only /!\ .To generate non-randomized tokens.'
            )
            ->addOption(
                self::OPT_TEST_EMAIL,
                null,
                InputOption::VALUE_OPTIONAL,
                'To send the email to a tester.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $debate = $this->getDebate($input);
        $isReminder = $input->getOption(self::OPT_REMINDER);
        $limit = $input->getOption(self::OPT_LIMIT);
        $batch = $input->getOption(self::OPT_BATCH);
        $testEmail = $input->getOption(self::OPT_TEST_EMAIL);
        if ($batch < 1) {
            $batch = self::OPT_BATCH_DEFAULT;
        }
        $total = $testEmail
            ? 1
            : $this->userRepository->countConfirmedUsersWithoutVoteInDebate($debate);
        $usersLoaded = 0;
        $mailSent = 0;
        $progressBar = new ProgressBar($output, $limit ?? $total);
        do {
            $users = $this->getUsers($debate, $usersLoaded, $testEmail);
            $usersLoaded += \count($users);

            foreach ($users as $user) {
                try {
                    $voteToken = $this->getVoteToken($user, $debate);
                    if (
                        null === $voteToken
                        || ($isReminder && $voteToken->isValid())
                        || $testEmail
                    ) {
                        $this->sendInvitation(
                            $user,
                            $debate,
                            $voteToken,
                            $isReminder,
                            $input->getOption(self::OPT_TEST_TOKEN)
                        );
                        ++$mailSent;
                        if (0 === $mailSent % $batch) {
                            $this->em->flush();
                        }
                        if ($limit) {
                            if ($limit <= $mailSent) {
                                break;
                            }
                            $progressBar->advance();
                        }
                    }
                } catch (\Exception $exception) {
                    $output->writeln(
                        '<error>DebateInvitationCommand error : ' .
                            $user->getEmail() .
                            ' => ' .
                            $exception->getMessage() .
                            '</error>'
                    );
                }
                if (null === $limit) {
                    $progressBar->advance();
                }
            }
        } while ($usersLoaded < $total && (null === $limit || $mailSent < $limit));
        $this->em->flush();
        $progressBar->finish();

        $output->writeln("\n{$mailSent} email(s) sent to invite to debate " . $debate->getId());

        return 0;
    }

    private function getUsers(Debate $debate, int $usersLoaded, ?string $testEmail): array
    {
        if ($testEmail) {
            $testUser = $this->userRepository->findOneByEmail($testEmail);
            if ($testUser) {
                return [$testUser];
            }

            throw new \RuntimeException($testEmail . ' not found');
        }

        return $this->userRepository->getConfirmedUsersWithoutVoteInDebate($debate, $usersLoaded);
    }

    private function sendInvitation(
        User $user,
        Debate $debate,
        ?DebateVoteToken $token,
        bool $isReminder,
        bool $fixedToken = false
    ): void {
        if (null === $token) {
            $token = $this->createVoteToken($user, $debate, $fixedToken);
        }

        $this->debateNotifier->sendDebateInvitation($token, $isReminder);
    }

    private function createVoteToken(
        User $user,
        Debate $debate,
        bool $fixedToken = false
    ): DebateVoteToken {
        $testToken = $fixedToken ? $debate->getId() . '-' . $user->getId() : null;

        $token = new DebateVoteToken($user, $debate, $testToken);
        $this->em->persist($token);

        return $token;
    }

    private function getVoteToken(User $user, Debate $debate): ?DebateVoteToken
    {
        return $this->voteTokenRepository->getUserDebateToken($user, $debate);
    }

    private function getDebate(InputInterface $input): Debate
    {
        $debateId = $input->getArgument(self::ARG_DEBATE);
        $debate = $this->debateRepository->find($debateId);
        if (null === $debate) {
            throw new \RuntimeException("debate {$debateId} not found");
        }

        return $debate;
    }
}
