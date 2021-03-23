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

class DebateInvitationCommand extends Command
{
    public const NAME = 'capco:debate:invite';
    public const ARG_DEBATE = 'debate';
    public const OPT_REMINDER = 'reminder';
    public const OPT_TIME = 'time';
    public const OPT_BATCH = 'batch';

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
            ->addArgument(self::ARG_DEBATE, InputArgument::REQUIRED, 'the id of the debate')
            ->addOption(
                self::OPT_TIME,
                null,
                InputOption::VALUE_OPTIONAL,
                '/!\ Should be used for CI only /!\ .The relative time you want to send email.',
                'now'
            )
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
                10
            )
            ->setDescription('Send an email to all confirmed users who has not voted in debate');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $debate = $this->getDebate($input);
        $users = $this->userRepository->getConfirmedUsersWithoutVoteInDebate($debate);
        $isReminder = $input->getOption(self::OPT_REMINDER);
        $progressBar = new ProgressBar($output, \count($users));

        $counter = 0;
        foreach ($users as $user) {
            $voteToken = $this->getVoteToken($user, $debate);
            if ($isReminder || null === $voteToken) {
                $this->sendInvitation($user, $debate, $voteToken, $isReminder);
                ++$counter;
                if (0 === $counter % $input->getOption(self::OPT_BATCH)) {
                    $this->em->flush();
                }
            }
            $progressBar->advance();
        }
        $this->em->flush();
        $progressBar->finish();

        $output->writeln($counter . ' email sent to invite to debate ' . $debate->getId());

        return 0;
    }

    private function sendInvitation(
        User $user,
        Debate $debate,
        ?DebateVoteToken $token,
        bool $isReminder
    ): void {
        if (null === $token) {
            $token = $this->createVoteToken($user, $debate);
        }

        $this->debateNotifier->sendDebateInvitation($token, $isReminder);
    }

    private function createVoteToken(User $user, Debate $debate): DebateVoteToken
    {
        $token = new DebateVoteToken($user, $debate);
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
            throw new \RuntimeException("debate ${debateId} not found");
        }

        return $debate;
    }
}
