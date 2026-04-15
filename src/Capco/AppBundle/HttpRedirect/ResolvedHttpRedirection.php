<?php

namespace Capco\AppBundle\HttpRedirect;

use Capco\AppBundle\Enum\HttpRedirectDuration;
use Symfony\Component\HttpFoundation\Response;

class ResolvedHttpRedirection
{
    public function __construct(
        private readonly string $destinationUrl,
        private readonly string $duration,
        private readonly string $redirectType
    ) {
    }

    public function getDestinationUrl(): string
    {
        return $this->destinationUrl;
    }

    public function getDuration(): string
    {
        return $this->duration;
    }

    public function getRedirectType(): string
    {
        return $this->redirectType;
    }

    public function getStatusCode(): int
    {
        return HttpRedirectDuration::TEMPORARY === $this->duration
            ? Response::HTTP_FOUND
            : Response::HTTP_MOVED_PERMANENTLY;
    }

    /**
     * @return array{destinationUrl: string, duration: string, redirectType: string}
     */
    public function toCachePayload(): array
    {
        return [
            'destinationUrl' => $this->destinationUrl,
            'duration' => $this->duration,
            'redirectType' => $this->redirectType,
        ];
    }

    /**
     * @param array{destinationUrl?: mixed, duration?: mixed, redirectType?: mixed} $payload
     */
    public static function fromCachePayload(array $payload): ?self
    {
        if (!isset($payload['destinationUrl'], $payload['duration'], $payload['redirectType'])) {
            return null;
        }
        if (!\is_string($payload['destinationUrl']) || !\is_string($payload['duration']) || !\is_string($payload['redirectType'])) {
            return null;
        }

        return new self(
            $payload['destinationUrl'],
            $payload['duration'],
            $payload['redirectType']
        );
    }
}
