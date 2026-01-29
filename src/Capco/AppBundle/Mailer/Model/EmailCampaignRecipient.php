<?php

namespace Capco\AppBundle\Mailer\Model;

use Capco\AppBundle\Mailer\Enum\EmailingCampaignUserStatus;
use Capco\AppBundle\Mailer\Enum\RecipientType;

class EmailCampaignRecipient
{
    public function __construct(
        // required properties
        private readonly string $email,
        private readonly RecipientType $type,
        // end
        // required nullable properties
        private readonly ?string $id,
        private readonly ?string $username,
        private readonly ?string $locale,
        private readonly ?string $token,
        // end
        // optional properties
        private ?string $actionToken = null,
        private bool $resetConsuptionDate = false,
        private bool $createTokenInDatabase = false,
        private ?EmailingCampaignUserStatus $statusToSave = null,
        // end
    ) {
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getType(): RecipientType
    {
        return $this->type;
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function getActionToken(): ?string
    {
        return $this->actionToken;
    }

    public function setActionToken(?string $actionToken): self
    {
        $this->actionToken = $actionToken;

        return $this;
    }

    public function isResetConsuptionDate(): bool
    {
        return $this->resetConsuptionDate;
    }

    public function setResetConsuptionDate(bool $resetConsuptionDate): self
    {
        $this->resetConsuptionDate = $resetConsuptionDate;

        return $this;
    }

    public function isCreateTokenInDatabase(): bool
    {
        return $this->createTokenInDatabase;
    }

    public function setCreateTokenInDatabase(bool $createTokenInDatabase): self
    {
        $this->createTokenInDatabase = $createTokenInDatabase;

        return $this;
    }

    public function getStatusToSave(): ?EmailingCampaignUserStatus
    {
        return $this->statusToSave;
    }

    public function setStatusToSave(?EmailingCampaignUserStatus $statusToSave): self
    {
        $this->statusToSave = $statusToSave;

        return $this;
    }
}
