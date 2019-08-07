<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SectionContributionsCountResolver implements ResolverInterface
{
    private $opinionRepository;

    public function __construct(OpinionRepository $opinionRepository)
    {
        $this->opinionRepository = $opinionRepository;
    }

    public function __invoke(OpinionType $type, ?User $viewer): int
    {
        return $this->opinionRepository->countByOpinionType($type->getId(), null, false, $viewer);
    }
}
