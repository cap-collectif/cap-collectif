<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ReportingUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly UrlResolver $urlResolver
    ) {}

    // Public URL of the reported contribution, as the "Link" row of the former Sonata page
    public function __invoke(Reporting $reporting): string
    {
        return $this->urlResolver->getObjectUrl($reporting, true);
    }
}
