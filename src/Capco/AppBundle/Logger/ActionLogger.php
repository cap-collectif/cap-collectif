<?php

namespace Capco\AppBundle\Logger;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Enum\LogActionDescription;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Message\AppLogMessage;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\MessageBusInterface;

class ActionLogger
{
    public function __construct(
        private readonly MessageBusInterface $messageBus,
        private readonly RequestGuesser $requestGuesser,
        private readonly LoggerInterface $logger,
        private readonly RequestStack $requestStack,
    ) {
    }

    public function logGraphQLMutation(
        User|Organization|null $user,
        string $actionType,
        ?string $description = null,
        ?string $entityType = null,
        ?string $entityId = null,
    ): bool {
        return $this->log(
            user: $user,
            actionType: $actionType,
            description: $description,
            entityType: $entityType,
            entityId: $entityId
        );
    }

    public function logGraphQLQuery(
        User|Organization|null $user,
        Argument $args,
        string $actionType,
        ?string $description = null,
        ?string $entityType = null,
        ?string $entityId = null,
    ): bool {
        if (
            null === $user
            || !$args->offsetExists('isLogged')
        ) {
            return false;
        }

        return $this->log(
            user: $user,
            actionType: $actionType,
            description: $description,
            entityType: $entityType,
            entityId: $entityId
        );
    }

    public function logExport(
        User|Organization $user,
        string $description
    ): bool {
        return $this->log(
            user: $user,
            actionType: LogActionType::EXPORT,
            description: sprintf('%s %s', LogActionDescription::EXPORT_PREFIX, $description)
        );
    }

    public function log(
        User|Organization|null $user,
        string $actionType,
        string $description,
        ?string $entityType = null,
        ?string $entityId = null,
    ): bool {
        if ($user instanceof Organization) {
            $user = $user->getUserAdmin();
        }

        $canLog = $this->canLog($user, $actionType);

        if (!$canLog) {
            return false;
        }

        $this->messageBus->dispatch(
            new AppLogMessage(
                userId: $user->getId(),
                actionType: $actionType,
                description: $description,
                entityType: $entityType,
                entityId: $entityId,
                ip: $this->requestGuesser::getClientIpFromRequest($this->requestStack->getCurrentRequest())
            )
        );

        return true;
    }

    private function canLog(?User $user, string $actionType): bool
    {
        if (
            null === $user
            || null === $this->requestStack->getCurrentRequest()
            || !$user->canBeAppLoggedBy()
        ) {
            $this->logger->error('You can not access to this action.');

            return false;
        }

        if (!LogActionType::isValid($actionType)) {
            throw new UserError('Invalid log action type.');
        }

        return true;
    }
}
