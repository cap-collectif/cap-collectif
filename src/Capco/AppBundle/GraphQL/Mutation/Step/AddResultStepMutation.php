<?php

namespace Capco\AppBundle\GraphQL\Mutation\Step;

use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddResultStepMutation implements MutationInterface
{
    private AddStepService $addStepService;

    public function __construct(AddStepService $addStepService)
    {
        $this->addStepService = $addStepService;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        return $this->addStepService->addStep($input, $viewer, 'RESULT');
    }
}
