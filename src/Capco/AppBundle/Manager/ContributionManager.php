<?php

namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManager;

class ContributionManager
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function republishContributions(User $user): bool
    {
        $republishedCount = 0;
        foreach ($user->getContributions() as $contribution) {
            $contribution->setExpired(false);
            ++$republishedCount;
        }

        return $republishedCount > 0;
    }

    public function depublishContributions(User $user): bool
    {
        $expiredCount = 0;
        foreach ($user->getContributions() as $contribution) {
            $contribution->setExpired(true);
            ++$expiredCount;
        }

        return $expiredCount > 0;
    }
}
