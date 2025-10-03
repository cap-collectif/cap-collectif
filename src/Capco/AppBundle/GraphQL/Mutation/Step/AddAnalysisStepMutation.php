<?php

namespace Capco\AppBundle\GraphQL\Mutation\Step;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddAnalysisStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly AddStepService $addStepService
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        /** @var SelectionStep $step */
        ['step' => $step] = $this->addStepService->addStep($input, $viewer, 'ANALYSIS');

        return ['step' => $step];
    }
}
