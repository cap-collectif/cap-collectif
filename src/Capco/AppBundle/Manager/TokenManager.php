<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\Repository\Debate\DebateVoteTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class TokenManager
{
    private EntityManagerInterface $em;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->logger = $logger;
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

    private function createDebateVote(DebateVoteToken $voteToken, string $value): DebateVote
    {
        $vote = (new DebateVote())
            ->setType($value)
            ->setPublishedAt(new \DateTime())
            ->setUser($voteToken->getUser())
            ->setCreatedAt(new \DateTime())
            ->setDebate($voteToken->getDebate())
            ->setIpAddress($_SERVER['HTTP_TRUE_CLIENT_IP'] ?? null)
            ->setNavigator($_SERVER['HTTP_USER_AGENT'] ?? null)
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
}
