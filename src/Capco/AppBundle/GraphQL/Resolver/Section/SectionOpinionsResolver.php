<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SectionOpinionsResolver implements ResolverInterface
{
    private $opinionRepo;

    public function __construct(OpinionRepository $opinionRepo)
    {
        $this->opinionRepo = $opinionRepo;
    }

    public function __invoke(OpinionType $section, Argument $args): Connection
    {
        $totalCount = $this->opinionRepo->countByOpinionType($section->getId());

        $paginator = new Paginator(function (int $offset, int $limit) use ($section, $args) {
            // TODO use OpinionSearch here.
            return $this->opinionRepo
                ->getByOpinionTypeOrdered($section, $offset, $limit, $args->offsetGet('orderBy'))
                ->getIterator()
                ->getArrayCopy();
        });

        return $paginator->auto($args, $totalCount);
    }
}
