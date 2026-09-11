<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateStepContributionsResolver implements QueryInterface
{
    public function __construct(
        private readonly DebateArgumentRepository $debateArgumentRepository,
        private readonly DebateAnonymousArgumentRepository $debateAnonymousArgumentRepository
    ) {
    }

    /**
     * @return array{key: string, totalCount: int}
     */
    public function __invoke(DebateStep $step): array
    {
        $debate = $step->getDebate();

        return [
            'key' => 'contributions',
            'totalCount' => $debate
                ? $this->debateArgumentRepository->countByDebate($debate, [
                    'isPublished' => true,
                ]) + $this->debateAnonymousArgumentRepository->countPublishedByDebate($debate)
                : 0,
        ];
    }
}
