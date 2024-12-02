<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ReportingRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateArgumentViewerHasReportResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly ReportingRepository $repository)
    {
    }

    public function __invoke(DebateArgument $debateArgument, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return $this->repository->countByDebateArgumentAndUser($debateArgument, $viewer) > 0;
    }
}
