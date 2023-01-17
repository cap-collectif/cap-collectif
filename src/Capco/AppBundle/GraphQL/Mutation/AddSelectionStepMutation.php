<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddSelectionStepMutation implements MutationInterface
{
    private AddStepService $addStepService;

    public function __construct(AddStepService $addStepService) {
        $this->addStepService = $addStepService;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $input->offsetSet('stepType', 'SELECTION');

        ['step' => $step] = $this->addStepService->addStep($input, $viewer);

        return ['step' => $step];
    }

}
