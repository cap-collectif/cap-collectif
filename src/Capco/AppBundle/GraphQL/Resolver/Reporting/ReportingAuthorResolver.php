<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ReportingAuthorResolver implements QueryInterface
{
    public function __invoke(Reporting $reporting): ?User
    {
        return $reporting->getReporter();
    }
}
