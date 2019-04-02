<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReportingAuthorResolver implements ResolverInterface
{
    public function __invoke(Reporting $reporting): ?User
    {
        return $reporting->getReporter();
    }
}
