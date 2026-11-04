<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Repository\ReportingRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ReportingQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly ReportingRepository $reportingRepository
    ) {}

    public function __invoke(Argument $args): ?Reporting
    {
        // Reporting uses an auto-incremented integer id, exposed as is (no global id).
        $reporting = $this->reportingRepository->find($args->offsetGet('id'));

        return $reporting instanceof Reporting ? $reporting : null;
    }
}
