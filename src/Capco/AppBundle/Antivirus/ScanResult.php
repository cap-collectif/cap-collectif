<?php

declare(strict_types=1);

namespace Capco\AppBundle\Antivirus;

class ScanResult
{
    public const STATUS_CLEAN = 'clean';
    public const STATUS_INFECTED = 'infected';
    public const STATUS_ERROR = 'error';
    public const STATUS_UNAVAILABLE = 'unavailable';

    private function __construct(
        private readonly string $status,
        private readonly null|string $virusName = null,
        private readonly null|string $errorMessage = null
    ) {
    }

    public static function clean(): self
    {
        return new self(self::STATUS_CLEAN);
    }

    public static function infected(string $virusName): self
    {
        return new self(self::STATUS_INFECTED, $virusName);
    }

    public static function error(string $message): self
    {
        return new self(self::STATUS_ERROR, null, $message);
    }

    public static function unavailable(): self
    {
        return new self(self::STATUS_UNAVAILABLE, null, 'clamd is not available');
    }

    public function isClean(): bool
    {
        return self::STATUS_CLEAN === $this->status;
    }

    public function isInfected(): bool
    {
        return self::STATUS_INFECTED === $this->status;
    }

    public function isError(): bool
    {
        return self::STATUS_ERROR === $this->status;
    }

    public function isUnavailable(): bool
    {
        return self::STATUS_UNAVAILABLE === $this->status;
    }

    public function shouldAllowUpload(): bool
    {
        return $this->isClean() || $this->isUnavailable();
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getVirusName(): ?string
    {
        return $this->virusName;
    }

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }
}
