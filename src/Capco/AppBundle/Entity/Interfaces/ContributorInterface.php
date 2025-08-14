<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;

interface ContributorInterface
{
    /**
     * @return null|string
     */
    public function getEmail();

    /**
     * @param null|string $email
     */
    public function setEmail($email);

    public function getLastname(): ?string;

    public function setLastname(?string $lastname): self;

    public function getFirstname(): ?string;

    public function setFirstname(?string $firstname): self;

    public function getPhone(): ?string;

    public function setPhone(?string $phone): self;

    public function getDateOfBirth(): ?\DateTimeInterface;

    public function setDateOfBirth(?\DateTimeInterface $dateOfBirth): self;

    public function isPhoneConfirmed(): bool;

    public function setPhoneConfirmed(bool $phoneConfirmed): self;

    public function getUserIdentificationCode(): ?UserIdentificationCode;

    public function setUserIdentificationCode(?UserIdentificationCode $userIdentificationCode): self;

    public function getUserIdentificationCodeValue(): ?string;

    public function getShowName(): ?string;

    public function getLocale(): ?string;

    public function setLocale(?string $locale): self;

    public function getZipCode(): ?string;

    public function isEmailConfirmed(): bool;

    public function getUsername(): ?string;

    public function isConsentInternalCommunication(): bool;

    public function isConsentPrivacyPolicy(): bool;
}
