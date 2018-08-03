<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\EventRegistration;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Psr\Log\LoggerInterface;

class ParticipantTypeResolver implements ResolverInterface
{
    private $typeResolver;
    private $logger;

    public function __construct(TypeResolver $typeResolver, LoggerInterface $logger)
    {
        $this->typeResolver = $typeResolver;
        $this->logger = $logger;
    }

    public function __invoke($node)
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
