<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Model\Publishable;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Psr\Log\LoggerInterface;

class ContributionManager
{
    private $indexer;
    private $logger;

    public function __construct(Indexer $indexer, LoggerInterface $logger)
    {
        $this->indexer = $indexer;
        $this->logger = $logger;
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
                    $this->indexer->index(
                        ClassUtils::getClass($contribution),
                        $contribution->getId()
                    );
                }
            }
        }

        try {
            $this->indexer->finishBulk();
        } catch (\RuntimeException $exception) {
            // In some rare cases indexation could failed
            // the user will not see his published contributions
            // Until next indexation
            $this->logger->warning('Could not index, published contributions of a user.', [
                'userId' => $user->getId(),
            ]);
        }

        return $republishedCount > 0;
    }
}
