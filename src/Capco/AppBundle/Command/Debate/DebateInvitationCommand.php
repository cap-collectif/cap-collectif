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
            ->setDescription('Send an email to all confirmed users who has not voted in debate');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $debate = $this->getDebate($input);
        $users = $this->userRepository->getConfirmedUsersWithoutVoteInDebate($debate);
        $isReminder = $input->getOption(self::OPT_REMINDER);

        $voteTokens = [];
        foreach ($users as $user) {
            $voteToken = $this->getOrCreateVoteToken($user, $debate);
            $voteTokens[] = $voteToken;
        }
        $this->em->flush();

        foreach ($voteTokens as $voteToken) {
            $this->debateNotifier->sendDebateInvitation($voteToken, $isReminder);
        }

        $output->writeln(\count($users) . ' email sent to invite to debate ' . $debate->getId());

        return 0;
    }

    private function getOrCreateVoteToken(User $user, Debate $debate): DebateVoteToken
    {
        $token = $this->voteTokenRepository->getUserDebateToken($user, $debate);
        if (null === $token) {
            $token = new DebateVoteToken($user, $debate);
            $this->em->persist($token);
        }

        return $token;
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
