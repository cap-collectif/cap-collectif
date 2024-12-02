<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CivicIA\CivicIAMassUpdater;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateCivicIAMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly CivicIAMassUpdater $updater)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $results = $this->updater->__invoke($input->offsetGet('data'), $viewer);

            return ['analyzables' => $results];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }
}
