<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateStepContributorsResolver implements QueryInterface
{
    public function __construct(
        private readonly DebateAnonymousVoteRepository $debateAnonymousVoteRepository,
        private readonly UserRepository $userRepository
    ) {
    }

    /**
     * @return array{key: string, totalCount: int}
     */
    public function __invoke(DebateStep $step): array
    {
        $debate = $step->getDebate();

        return [
            'key' => 'contributors',
            'totalCount' => $debate
                ? $this->userRepository->countDebateParticipants($debate)
                    + $this->debateAnonymousVoteRepository->countByDebate($debate)
                : 0,
        ];
    }
}
