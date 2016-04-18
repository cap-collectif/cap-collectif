<?php

namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Manager\Notify;
use Doctrine\ORM\EntityManager;

class ContributionManager
{
    public function __construct(Notify $notifier, EntityManager $em)
    {
      $this->notifier = $notifier;
      $this->em = $em;
    }

    public function depublishContributions(User $user)
    {
      $contributionsDeletedCount = 0;
      foreach ($user->getOpinions() as $opinion)
      {
        $opinion->setIsEnabled(false);
        $contributionsDeletedCount++;
      }
      foreach ($user->getVotes() as $vote)
      {
        $this->em->remove($vote);
        $contributionsDeletedCount++;
      }
      foreach ($user->getOpinionVersions() as $version)
      {
        $version->setEnabled(false);
        $contributionsDeletedCount++;
      }
      foreach ($user->getIdeas() as $idea)
      {
        $idea->setIsEnabled(false);
        $contributionsDeletedCount++;
      }
      foreach ($user->getComments() as $comment)
      {
        $comment->setIsEnabled(false);
        $contributionsDeletedCount++;
      }
      foreach ($user->getArguments() as $argument)
      {
        $argument->setIsEnabled(false);
        $contributionsDeletedCount++;
      }
      foreach ($user->getSources() as $source)
      {
        $source->setIsEnabled(false);
        $contributionsDeletedCount++;
      }
      foreach ($user->getProposals() as $proposal)
      {
        $proposal->setEnabled(false);
        $contributionsDeletedCount++;
      }

      return $contributionsDeletedCount > 0;
    }
}
