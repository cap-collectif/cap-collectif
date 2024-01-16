<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ReportingTypeResolver implements QueryInterface
{
    public function __invoke(Reporting $reporting): int
    {
        return $reporting->getStatus();
    }
}
