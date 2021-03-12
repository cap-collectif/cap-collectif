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
    private DebateVoteTokenRepository $voteTokenRepository;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        DebateVoteTokenRepository $voteTokenRepository,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->voteTokenRepository = $voteTokenRepository;
        $this->logger = $logger;
    }

    public function consumeVoteToken(string $token, string $value): DebateVote
    {
        $this->checkValue($value);
        $voteToken = $this->getVoteToken($token);
        $this->checkUserHasNotVoted($voteToken);
        $debateVote = $this->createDebateVote($voteToken, $value);
        $this->em->remove($voteToken);
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

            throw new \Exception("invalid value ${value}"); //todo clé de trad
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

                throw new \Exception('already-voted'); //todo clé de trad
            }
        }
    }

    private function getVoteToken(string $token): DebateVoteToken
    {
        $voteToken = $this->voteTokenRepository->find($token);
        if (null === $voteToken) {
            $this->logger->info("invalid token ${token} used to vote on debate");

            throw new \Exception('invalid-token'); //todo clé de trad
        }

        return $voteToken;
    }
}
