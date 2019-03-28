<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReportingTypeResolver implements ResolverInterface
{
    public function __invoke(Reporting $reporting)
    {
        return $reporting->getStatus();
    }
}
