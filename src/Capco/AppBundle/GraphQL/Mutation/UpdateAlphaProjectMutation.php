<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\Persister\ProjectPersister;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateAlphaProjectMutation implements MutationInterface
{

    private $persister;

    public function __construct(ProjectPersister $persister)
    {
        $this->persister = $persister;
    }

    public function __invoke(Argument $input): array
    {
        $project = $this->persister->persist($input, true);

        return ['project' => $project];
    }
}
