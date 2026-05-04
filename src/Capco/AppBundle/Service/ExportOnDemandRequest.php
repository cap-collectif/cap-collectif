<?php

namespace Capco\AppBundle\Service;

use Capco\UserBundle\Entity\User;

final class ExportOnDemandRequest
{
    public function __construct(
        private readonly string $commandName,
        /** @var array<string, mixed> */
        private readonly array $commandOptions,
        private readonly string $filePath,
        private readonly string $downloadUrl,
        private readonly User $user,
        private readonly string|null $fileName = null,
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

    public function getUser(): User
    {
        return $this->user;
    }

    public function getFileName(): ?string
    {
        return $this->fileName;
    }
}
