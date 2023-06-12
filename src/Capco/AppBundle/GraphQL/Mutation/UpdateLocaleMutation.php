<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class UpdateLocaleMutation implements MutationInterface
{
    public function __invoke(Argument $input, RequestStack $requestStack): array
    {
        $locale = $input->offsetGet('locale');

        $request = $requestStack->getCurrentRequest();
        $request->getSession()->set('_locale', $locale);

        return ['locale' => $locale];
    }
}