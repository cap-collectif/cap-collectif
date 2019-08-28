<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver as BaseTypeResolver;
use Overblog\GraphQLBundle\Error\UserError;

class TypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(BaseTypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data): Type
    {
        if ($data instanceof Oauth2SSOConfiguration) {
            return $this->typeResolver->resolve('InternalOauth2SSOConfiguration');
        }

        if ($data instanceof FranceConnectSSOConfiguration) {
            return $this->typeResolver->resolve('InternalFranceConnectSSOConfiguration');
        }

        throw new UserError('Could not resolve type of SSO Configuration.');
    }
}
