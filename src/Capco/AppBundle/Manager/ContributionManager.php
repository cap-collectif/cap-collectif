<?php
namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;

class ContributionManager
{
    public function publishContributions(User $user): bool
    {
        $republishedCount = 0;
        foreach ($user->getContributions() as $contribution) {
            if ($contribution instanceof Publishable) {
                $step = $contribution->getStep();
                // We only publish comments (no step)
                // or contributions in an open step
                if (!$step || $step->isOpen()) {
                    $contribution->setPublishedAt(new \DateTime());
                }
                ++$republishedCount;
            }
        }

        return $republishedCount > 0;
    }
}
