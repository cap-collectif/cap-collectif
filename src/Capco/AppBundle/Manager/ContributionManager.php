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

    public function republishContributions(User $user)
    {
        $contributions = $user->getContributions();
        foreach ($contributions as $contribution) {
            $contribution->setExpired(false);
        }

        return count($contributions) > 0;
    }

    public function depublishContributions(User $user)
    {
        $contributions = $user->getContributions();
        foreach ($contributions as $contribution) {
            $contribution->setExpired(true);
        }

        return count($contributions) > 0;
    }
}
