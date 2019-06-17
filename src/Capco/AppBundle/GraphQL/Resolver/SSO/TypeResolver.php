<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Resolver\TypeResolver as BaseTypeResolver;

class TypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(BaseTypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data)
    {
        // Uncomment it when we will add more SSO Configuration type.
        /* if ($data instanceof Oauth2SSOConfiguration) {
            return $this->typeResolver->resolve('InternalOauth2SSOConfiguration');
        } */
        // throw new UserError('Could not resolve type of SSO Configuration.');

        return $this->typeResolver->resolve('InternalOauth2SSOConfiguration');
    }
}
