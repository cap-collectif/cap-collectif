<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\AbstractSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver as BaseTypeResolver;
use Overblog\GraphQLBundle\Error\UserError;

class TypeResolver implements ResolverInterface
{
    private BaseTypeResolver $typeResolver;

    public function __construct(BaseTypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractSSOConfiguration $data): Type
    {
        if ($data instanceof Oauth2SSOConfiguration) {
            return $this->typeResolver->resolve('InternalOauth2SSOConfiguration');
        }

        if ($data instanceof FranceConnectSSOConfiguration) {
            return $this->typeResolver->resolve('InternalFranceConnectSSOConfiguration');
        }

        if ($data instanceof FacebookSSOConfiguration) {
            return $this->typeResolver->resolve('InternalFacebookSSOConfiguration');
        }

        throw new UserError('Could not resolve type of SSO Configuration.');
    }
}
