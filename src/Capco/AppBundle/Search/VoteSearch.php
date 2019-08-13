<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;

class VoteSearch extends Search
{
    private $abstractVoteRepository;

    public function __construct(Index $index, AbstractVoteRepository $abstractVoteRepository)
    {
        parent::__construct($index);
        $this->type = 'comment';
        $this->index = $index;
        $this->abstractVoteRepository = $abstractVoteRepository;
    }

    public function getVotesByAuthorViewerCanSee(
        User $author,
        User $viewer,
        int $limit = 100,
        int $offset = 0
    ): array {
    }
}
