<?php
namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;

class ContributionManager
{
    // This will be renamed `publishContributions`
    public function republishContributions(User $user): bool
    {
        $republishedCount = 0;
        foreach ($user->getContributions() as $contribution) {
            $contribution->setExpired(false);
            if ($contribution instanceof Publishable) {
                $step = $contribution->getStep();
                // We only publish comments (no step)
                // or contributions in an open step
                if (!$step || $step->isOpen()) {
                    $contribution->setPublishedAt(new \DateTime());
                }
            }
            ++$republishedCount;
        }

        return $republishedCount > 0;
    }

    // This will be deleted
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
