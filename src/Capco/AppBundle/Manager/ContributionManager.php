<?php

namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManager;

class ContributionManager
{
    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function depublishContributions(User $user)
    {
        $contributionsExpiredCount = 0;
        foreach ($user->getOpinions() as $opinion) {
            $opinion->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getVotes() as $vote) {
            $vote->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getOpinionVersions() as $version) {
            $version->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getIdeas() as $idea) {
            $idea->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getComments() as $comment) {
            $comment->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getArguments() as $argument) {
            $argument->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getSources() as $source) {
            $source->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getProposals() as $proposal) {
            $proposal->setExpired(true);
            ++$contributionsExpiredCount;
        }
        foreach ($user->getReplies() as $reply) {
            $reply->setExpired(true);
            ++$contributionsExpiredCount;
        }

        return $contributionsExpiredCount > 0;
    }
}
