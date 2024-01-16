<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class UpdateLocaleMutation implements MutationInterface
{
    use MutationTrait;

    public function __invoke(Argument $input, RequestStack $requestStack): array
    {
        $this->formatInput($input);
        $locale = $input->offsetGet('locale');

        $request = $requestStack->getCurrentRequest();
        $request->getSession()->set('_locale', $locale);

        return ['locale' => $locale];
    }
}
