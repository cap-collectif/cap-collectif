<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SectionOpinionsResolver implements ResolverInterface
{
    private $opinionRepo;

    public function __construct(OpinionRepository $opinionRepo)
    {
        $this->opinionRepo = $opinionRepo;
    }

    public function __invoke(OpinionType $section, Argument $args, ?User $viewer): Connection
    {
        $userId = null;
        if ($args->offsetExists('author') && $args->offsetGet('author')) {
            $userId = GlobalId::fromGlobalId($args->offsetGet('author'))['id'];
        }

        $includeTrashed = false;
        if ($args->offsetExists('includeTrashed') && $args->offsetGet('includeTrashed')) {
            $includeTrashed = $args->offsetGet('includeTrashed');
        }

        $totalCount = $this->opinionRepo->countByOpinionType(
            $section->getId(),
            $userId,
            $includeTrashed
        );

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $section,
            $args,
            $viewer,
            $userId,
            $includeTrashed
        ) {
            // TODO use OpinionSearch here.
            return $this->opinionRepo
                ->getByOpinionTypeOrdered(
                    $section,
                    $offset,
                    $limit,
                    $args->offsetGet('orderBy'),
                    $viewer,
                    $userId,
                    $includeTrashed
                )
                ->getIterator()
                ->getArrayCopy();
        });

        return $paginator->auto($args, $totalCount);
    }
}
