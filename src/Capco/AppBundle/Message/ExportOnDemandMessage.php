<?php

namespace Capco\AppBundle\Message;

final class ExportOnDemandMessage
{
    /**
     * @param array<string, mixed> $commandOptions
     */
    public function __construct(
        private readonly string $commandName,
        private readonly array $commandOptions,
        private readonly string $filePath,
        private readonly string $downloadUrl,
        private readonly string $userId,
        private readonly string $userEmail,
        private readonly ?string $username,
        private readonly ?string $userLocale,
        private readonly ?string $fileName,
    ) {
    }

    public function getCommandName(): string
    {
        return $this->commandName;
    }

    /**
     * @return array<string, mixed>
     */
    public function getCommandOptions(): array
    {
        return $this->commandOptions;
    }

    public function getFilePath(): string
    {
        return $this->filePath;
    }

    public function getDownloadUrl(): string
    {
        return $this->downloadUrl;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getUserEmail(): string
    {
        return $this->userEmail;
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
