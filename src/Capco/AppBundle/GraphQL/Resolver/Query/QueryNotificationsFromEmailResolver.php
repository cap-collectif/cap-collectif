<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryNotificationsFromEmailResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    public function __invoke(): ?string
    {
        $siteParameter = $this->repository->findOneBy([
            'keyname' => 'admin.mail.notifications.send_address',
        ]);

        return $siteParameter ? $siteParameter->getValue($this->localeResolver->resolve()) : null;
    }
}
