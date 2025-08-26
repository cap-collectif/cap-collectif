<?php

namespace Capco\AppBundle\Message;

class AppLogMessage
{
    public function __construct(
        private readonly string $userId,
        private readonly string $actionType,
        private readonly ?string $description,
        private readonly ?string $entityType,
        private readonly ?string $entityId,
        private readonly ?string $ip
    ) {
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getActionType(): string
    {
        return $this->actionType;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function getEntityId(): ?string
    {
        return $this->entityId;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }
}
