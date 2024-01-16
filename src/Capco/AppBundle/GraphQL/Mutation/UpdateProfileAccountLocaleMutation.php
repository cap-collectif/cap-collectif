<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Mutation\Locale\SetUserDefaultLocaleMutation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UpdateProfileAccountLocaleMutation implements MutationInterface
{
    use MutationTrait;
    private SetUserDefaultLocaleMutation $defaultLocaleMutation;

    public function __construct(SetUserDefaultLocaleMutation $defaultLocaleMutation)
    {
        $this->defaultLocaleMutation = $defaultLocaleMutation;
    }

    public function __invoke(Argument $input, User $viewer, RequestStack $requestStack): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $request = $requestStack->getCurrentRequest();

        try {
            $viewer = $this->defaultLocaleMutation->setUserDefaultLocale(
                $viewer,
                $arguments['locale']
            );
            if ($arguments['locale']) {
                $request->setLocale($arguments['locale']);
            }
        } catch (BadRequestHttpException $exception) {
            return ['error' => $exception->getMessage()];
        }

        return ['viewer' => $viewer, 'code' => $arguments['locale']];
    }
}
