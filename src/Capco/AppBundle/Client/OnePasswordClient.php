<?php

declare(strict_types=1);

namespace Capco\AppBundle\Client;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class OnePasswordClient
{
    private const FIELD_USERNAME = 'USERNAME';
    private const FIELD_PASSWORD = 'PASSWORD';
    private const MAX_RESPONSE_BODY_LENGTH = 1048576;

    private readonly string $connectUrl;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        string $connectUrl,
        private readonly string $connectToken,
        private readonly string $vaultId,
    ) {
        $connectUrl = rtrim(trim($connectUrl), '/');
        $this->validateConfiguration($connectUrl, $connectToken, $vaultId);

        $this->connectUrl = $connectUrl;
    }

    /**
     * @return array{username: string, password: string}
     */
    public function credentials(string $itemName): array
    {
        $itemName = trim($itemName);
        if ('' === $itemName) {
            throw new \InvalidArgumentException('1Password item name is required.');
        }

        $items = $this->request($this->itemsUrl());
        $itemId = null;
        foreach ($items as $item) {
            if (!\is_array($item) || ($item['title'] ?? null) !== $itemName) {
                continue;
            }
            $itemId = $item['id'] ?? null;
        }

        if (!\is_string($itemId) || '' === $itemId) {
            throw new \RuntimeException(sprintf('1Password item "%s" not found.', $itemName));
        }

        $item = $this->request($this->itemsUrl() . '/' . rawurlencode($itemId));
        $username = null;
        $password = null;
        $fields = $item['fields'] ?? [];
        if (!\is_array($fields)) {
            throw new \RuntimeException(sprintf('1Password item "%s" has incomplete login fields.', $itemName));
        }
        foreach ($fields as $field) {
            if (!\is_array($field) || !\is_string($field['value'] ?? null)) {
                continue;
            }
            if (self::FIELD_USERNAME === ($field['purpose'] ?? null)) {
                $username = $field['value'];
            }
            if (self::FIELD_PASSWORD === ($field['purpose'] ?? null)) {
                $password = $field['value'];
            }
        }

        if (null === $username || null === $password || '' === $username || '' === $password) {
            throw new \RuntimeException(sprintf('1Password item "%s" has incomplete login fields.', $itemName));
        }
        if ($username !== $itemName) {
            throw new \RuntimeException(sprintf('1Password item "%s" username does not match item name.', $itemName));
        }

        return ['username' => $username, 'password' => $password];
    }

    /**
     * @return array<int|string, mixed>
     */
    private function request(string $url): array
    {
        try {
            $response = $this->httpClient->request('GET', $url, [
                'headers' => [
                    'Accept' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->connectToken,
                ],
                'buffer' => false,
            ]);
            $statusCode = $response->getStatusCode();
        } catch (\Throwable $exception) {
            throw new \RuntimeException('1Password Connect request failed.', 0, $exception);
        }

        if ($statusCode < Response::HTTP_OK || $statusCode >= Response::HTTP_MULTIPLE_CHOICES) {
            throw new \RuntimeException(sprintf('1Password Connect returned HTTP %d.', $statusCode));
        }

        try {
            $content = '';
            foreach ($this->httpClient->stream($response) as $chunk) {
                if ($chunk->isTimeout()) {
                    continue;
                }
                if ($chunk->isLast()) {
                    break;
                }

                $chunkContent = $chunk->getContent();
                if (self::MAX_RESPONSE_BODY_LENGTH < \strlen($content) + \strlen($chunkContent)) {
                    $response->cancel();

                    throw new \LengthException('1Password Connect response is too large.');
                }
                $content .= $chunkContent;
            }
        } catch (\LengthException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            throw new \RuntimeException('Unable to read the 1Password Connect response.', 0, $exception);
        }

        try {
            $data = json_decode($content, true, 512, \JSON_THROW_ON_ERROR);
        } catch (\Throwable $exception) {
            throw new \RuntimeException('Invalid JSON returned by 1Password Connect.', 0, $exception);
        }
        if (!\is_array($data)) {
            throw new \RuntimeException('Invalid JSON returned by 1Password Connect.');
        }

        return $data;
    }

    private function validateConfiguration(string $connectUrl, string $connectToken, string $vaultId): void
    {
        $parsedUrl = parse_url($connectUrl);
        if (
            false === $parsedUrl
            || !isset($parsedUrl['scheme'], $parsedUrl['host'])
            || !\in_array($parsedUrl['scheme'], ['http', 'https'], true)
        ) {
            throw new \InvalidArgumentException('1Password Connect URL must be an absolute HTTP(S) URL.');
        }
        if ('' === trim($connectToken)) {
            throw new \InvalidArgumentException('1Password Connect token is required.');
        }
        if ('' === trim($vaultId)) {
            throw new \InvalidArgumentException('1Password vault ID is required.');
        }
    }

    private function itemsUrl(): string
    {
        return $this->connectUrl . '/v1/vaults/' . rawurlencode($this->vaultId) . '/items';
    }
}
