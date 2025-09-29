<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\UserBundle\Entity\User;

class ReplyCounterIndexer
{
    public function __construct(
        private readonly Indexer $indexer
    ) {
    }

    public function syncIndex(Reply $reply): void
    {
        if (!$this->canIndex($reply)) {
            return;
        }

        $contributor = $reply->getContributor();

        $this->indexer->index(Reply::class, $reply->getId());
        $this->indexer->finishBulk();

        if ($contributor instanceof User) {
            $this->indexer->index(User::class, $contributor->getId());
            $this->indexer->finishBulk();
        }
    }

    private function canIndex(Reply $reply): bool
    {
        if (ContributionCompletionStatus::MISSING_REQUIREMENTS === $reply->getCompletionStatus()) {
            return false;
        }

        return true;
    }
}
