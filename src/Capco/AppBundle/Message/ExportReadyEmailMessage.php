<?php

namespace Capco\AppBundle\Message;

final class ExportReadyEmailMessage
{
    public function __construct(
        private readonly string $userEmail,
        private readonly string $downloadUrl,
        private readonly ?string $username,
        private readonly ?string $userLocale,
        private readonly ?string $fileName,
    ) {
    }

    public function getUserEmail(): string
    {
        return $this->userEmail;
    }

    public function getDownloadUrl(): string
    {
        return $this->downloadUrl;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function getUserLocale(): ?string
    {
        return $this->userLocale;
    }

    public function getFileName(): ?string
    {
        return $this->fileName;
    }
}
