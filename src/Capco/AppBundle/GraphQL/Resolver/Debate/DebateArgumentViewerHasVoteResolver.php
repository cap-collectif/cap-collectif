<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentVoteRepository;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateArgumentViewerHasVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly DebateArgumentVoteRepository $debateArgumentVoteRepository,
        private readonly DebateAnonymousArgumentVoteRepository $debateAnonymousArgumentVoteRepository
    ) {
    }

    public function __invoke(DebateArgumentInterface $debateArgument, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return null !==
            $this->getRepository($debateArgument)->getOneByDebateArgumentAndUser(
                $debateArgument,
                $viewer
            );
    }

    private function getRepository(DebateArgumentInterface $debateArgument): EntityRepository
    {
        if ($debateArgument instanceof DebateArgument) {
            return $this->debateArgumentVoteRepository;
        }

        return $this->debateAnonymousArgumentVoteRepository;
    }
}
