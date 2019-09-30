<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class RegistrationScriptQueryResolver implements ResolverInterface
{
    private $siteParameterRepository;

    public function __construct(SiteParameterRepository $siteParameterRepository)
    {
        $this->siteParameterRepository = $siteParameterRepository;
    }

    public function __invoke()
    {
        $codeParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME
        ]);

        return $codeParameter ? $codeParameter->getValue() : '';
    }
}
