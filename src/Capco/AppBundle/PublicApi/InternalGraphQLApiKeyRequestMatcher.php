<?php

namespace Capco\AppBundle\PublicApi;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;

final class InternalGraphQLApiKeyRequestMatcher implements RequestMatcherInterface
{
    public function matches(Request $request): bool
    {
        return '/graphql/internal' === $request->getPathInfo()
            && 0 === stripos((string) $request->headers->get('Authorization', ''), 'Bearer ');
    }
}
