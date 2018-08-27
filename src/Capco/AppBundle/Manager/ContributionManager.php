<?php
namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Elasticsearch\IndexableInterface;

class ContributionManager
{
    private $indexer;

    public function __construct(Indexer $indexer)
    {
        $this->indexer = $indexer;
    }

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
                if ($contribution instanceof IndexableInterface) {
                    $this->indexer->index(\get_class($contribution), $contribution->getId());
                }
            }
        }
        $this->indexer->finishBulk();

        return $republishedCount > 0;
    }
}
