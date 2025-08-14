<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface PhoneVerificationSmsInterface
{
    public const APPROVED = 'APPROVED';
    public const PENDING = 'PENDING';
    public const ALREADY_CONFIRMED = 'ALREADY_CONFIRMED';

    public function getStatus(): string;

    public function setStatus(string $status): self;

    public function setCreatedAt(\DateTime $createdAt): self;

    public function setApproved(): self;

    public function setPending(): self;

    public function setAlreadyConfirmed(): self;
}
