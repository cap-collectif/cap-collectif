<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\Repository\ActionTokenRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Utils\RequestGuesser;

class TokenManager
{
    private EntityManagerInterface $em;
    private ActionTokenRepository $repository;
    private LoggerInterface $logger;
    private RequestGuesser $requestGuesser;

    public function __construct(
        EntityManagerInterface $em,
        ActionTokenRepository $repository,
        LoggerInterface $logger,
        RequestGuesser $requestGuesser
    ) {
        $this->em = $em;
        $this->repository = $repository;
        $this->logger = $logger;
        $this->requestGuesser = $requestGuesser;
    }

    public function consumeVoteToken(DebateVoteToken $voteToken, string $value): DebateVote
    {
        $this->checkValue($value);
        $this->checkUserHasNotVoted($voteToken);
        $debateVote = $this->createDebateVote($voteToken, $value);
        $voteToken->setConsumptionDate(new \DateTime());
        $this->em->flush();

        return $debateVote;
    }

    public function getOrCreateActionToken(User $user, string $action): ActionToken
    {
        $token = $this->repository->getUserActionToken($user, $action);
        if ($token) {
            if ($token->getConsumptionDate()) {
                $token->setConsumptionDate(null);
                $this->em->flush();
            }

            return $token;
        }

        return $this->createActionToken($user, $action);
    }

    public function consumeActionToken(ActionToken $actionToken): string
    {
        if (ActionToken::UNSUBSCRIBE === $actionToken->getAction()) {
            $this->consumeUnsubscribeToken($actionToken);

            return 'unsubscribe.success';
        }

        throw new \RuntimeException('invalid action ' . $actionToken->getAction());
    }

    private function consumeUnsubscribeToken(ActionToken $actionToken): void
    {
        if ($actionToken->getUser()->isConsentInternalCommunication()) {
            $actionToken->getUser()->setConsentInternalCommunication(false);
            $actionToken->setConsumptionDate(new \DateTime());
            $this->em->flush();
        }
    }

    private function createDebateVote(DebateVoteToken $voteToken, string $value): DebateVote
    {
        $vote = (new DebateVote())
            ->setType($value)
            ->setPublishedAt(new \DateTime())
            ->setUser($voteToken->getUser())
            ->setCreatedAt(new \DateTime())
            ->setDebate($voteToken->getDebate())
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setMailOrigin();
        $this->em->persist($vote);

        return $vote;
    }

    private function checkValue(string $value): void
    {
        if (!ForOrAgainstType::isValid($value)) {
            $this->logger->info("invalid value ${value} used to vote on debate");

            throw new \RuntimeException("invalid value ${value}");
        }
    }

    private function checkUserHasNotVoted(DebateVoteToken $voteToken): void
    {
        foreach ($voteToken->getUser()->getVotes() as $vote) {
            if ($vote instanceof DebateVote && $vote->getDebate() === $voteToken->getDebate()) {
                $this->logger->info(
                    $voteToken->getUser()->getUsername() .
                        ' has already voted on debate ' .
                        $voteToken
                            ->getDebate()
                            ->getStep()
                            ->getTitle()
                );

                throw new \RuntimeException('global.already_voted');
            }
        }
    }

    private function createActionToken(User $user, string $action): ActionToken
    {
        $token = new ActionToken($user, $action);
        $this->em->persist($token);
        $this->em->flush();

        return $token;
    }
}
