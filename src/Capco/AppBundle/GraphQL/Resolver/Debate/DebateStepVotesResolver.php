<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentVoteRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateStepVotesResolver implements QueryInterface
{
    public function __construct(
        private readonly DebateVoteRepository $debateVoteRepository,
        private readonly DebateAnonymousVoteRepository $debateAnonymousVoteRepository,
        private readonly DebateAnonymousArgumentVoteRepository $debateAnonymousArgumentVoteRepository,
        private readonly DebateArgumentVoteRepository $debateArgumentVoteRepository,
    ) {
    }

    /**
     * @return array{key: string, totalCount: int}
     */
    public function __invoke(DebateStep $step): array
    {
        $debate = $step->getDebate();

        $totalCount = $this->debateVoteRepository->countByDebate($debate, ['isPublished' => true])
            + $this->debateAnonymousVoteRepository->countByDebate($debate)
            + $this->debateArgumentVoteRepository->countByDebate($debate)
            + $this->debateAnonymousArgumentVoteRepository->countByDebate($debate);

        return [
            'key' => 'votes',
            'totalCount' => $debate
                ? $totalCount
                : 0,
        ];
    }
}
