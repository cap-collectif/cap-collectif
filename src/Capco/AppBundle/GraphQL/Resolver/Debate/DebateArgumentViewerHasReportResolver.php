<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DebateArgumentViewerHasReportResolver implements ResolverInterface
{
    use ResolverTrait;
    private ReportingRepository $repository;

    public function __construct(ReportingRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(DebateArgument $debateArgument, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return $this->repository->countByDebateArgumentAndUser($debateArgument, $viewer) > 0;
    }
}
