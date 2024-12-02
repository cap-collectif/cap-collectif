<?php

namespace Capco\AppBundle\GraphQL\Resolver\EventParticipant;

use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class EventParticipantTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke($node): ?Type
    {
        if ($node instanceof EventRegistration) {
            return $this->typeResolver->resolve('NotRegistered');
        }
        if ($node instanceof User) {
            return $this->typeResolver->resolve('InternalUser');
        }

        throw new UserError('Could not resolve type of Participant.');
    }
}
