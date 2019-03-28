<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SectionContributionRelayResolver implements ResolverInterface
{
    private $opinionRepository;

    public function __construct(OpinionRepository $opinionRepository)
    {
        $this->opinionRepository = $opinionRepository;
    }

    public function __invoke(OpinionType $section, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($section, $args) {
            $criteria = ['section' => $section, 'trashed' => false];
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];

            return $this->opinionRepository
                ->getByCriteriaOrdered($criteria, $orderBy, null, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $section->getOpinions()->count();

        return $paginator->auto($args, $totalCount);
    }
}
