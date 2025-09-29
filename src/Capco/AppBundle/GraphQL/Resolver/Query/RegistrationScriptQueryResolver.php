<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RegistrationScriptQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteParameterRepository $siteParameterRepository
    ) {
    }

    public function __invoke(): string
    {
        $codeParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME,
        ]);

        return $codeParameter ? (string) $codeParameter->getValue() : '';
    }
}
