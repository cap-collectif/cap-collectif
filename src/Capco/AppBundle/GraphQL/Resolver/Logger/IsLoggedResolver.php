<?php

namespace Capco\AppBundle\GraphQL\Resolver\Logger;

use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class IsLoggedResolver implements QueryInterface
{
    public function __construct(
        private readonly ActionLogger $actionLogger
    ) {
    }

    /**
     * @return array{actionType: LogActionType, description: string}
     */
    public function __invoke(EntityInterface $entity, Argument $argument, User $user): array
    {
        $description = $argument->offsetGet('description');
        $actionType = $argument->offsetGet('actionType');

        /*
         * Allow to customize description with entity getter
         * @regex https://regex101.com/r/zieEcH/1
         */
        preg_match('/:(\w+)/', (string) $description, $matches);

        $key = $entity->{$matches[1]}();

        $description = str_replace($matches[0], $key, $description);

        $this->actionLogger->log(
            user: $user,
            actionType: $actionType,
            description: $description
        );

        return [
            'actionType' => $actionType,
            'description' => $description,
        ];
    }
}
