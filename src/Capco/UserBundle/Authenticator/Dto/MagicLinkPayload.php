<?php

declare(strict_types=1);

namespace Capco\UserBundle\Authenticator\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class MagicLinkPayload
{
    public function __construct(
        /** @Assert\Email() */
        private readonly string $email,
        private readonly ?string $username,
        /** @Assert\Url() */
        private readonly string $redirect,
        private readonly \DateTimeInterface $createdAt = new \DateTimeImmutable(
        )
    ) {
    }

    public static function createFromPayload(
        object $payload
    ): self {
        return new self(
            $payload->email,
            $payload->username,
            $payload->redirect,
            new \DateTimeImmutable($payload->createdAt)
        );
    }

    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'username' => $this->username,
            'redirect' => $this->redirect,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
        ];
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getRedirect(): string
    {
        return $this->redirect;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }
}
