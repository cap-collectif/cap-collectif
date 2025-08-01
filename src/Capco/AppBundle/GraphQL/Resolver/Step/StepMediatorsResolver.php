<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\Repository\MediatorRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class StepMediatorsResolver implements QueryInterface
{
    public function __construct(private readonly ConnectionBuilderInterface $connectionBuilder, private readonly MediatorRepository $mediatorRepository)
    {
    }

    public function __invoke(AbstractStep $step, Arg $args, User $viewer): ConnectionInterface
    {
        $username = $args->offsetGet('username');

        if ($viewer->isMediator()) {
            $mediators = $this->mediatorRepository->findBy(['step' => $step, 'user' => $viewer]);

            return $this->connectionBuilder->connectionFromArray($mediators, $args);
        }

        if ($username) {
            $mediators = $this->mediatorRepository->findByUsernameAndStep($username, $step);

            return $this->connectionBuilder->connectionFromArray($mediators, $args);
        }

        $mediators = $step->getmediators()->toArray();

        return $this->connectionBuilder->connectionFromArray($mediators, $args);
    }
}
