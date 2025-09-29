<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SectionContributionsCountResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionRepository $opinionRepository
    ) {
    }

    public function __invoke(OpinionType $type, ?User $viewer): int
    {
        return $this->opinionRepository->countByOpinionType($type, null, false, $viewer);
    }
}
