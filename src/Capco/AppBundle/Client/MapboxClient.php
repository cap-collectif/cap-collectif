<?php

namespace Capco\AppBundle\Client;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;

class MapboxClient
{
    private const BASE_URL = 'https://api.mapbox.com';
    private const MAPBOX_INVALID_TOKEN_CODES = [
        'TokenMalformed',
        'TokenInvalid',
        'TokenExpired',
        'TokenRevoked',
    ];

    private $client;
    private $version = 'v2';
    private $endpoint;
    private $parameters = [];
    private $uri;
    private $path;

    public function __construct()
    {
        $this->client = new Client([
            'headers' => ['Content-Type' => 'application/json'],
        ]);
    }

    public function setEndpoint(string $endpoint): self
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function setPath(string $path): self
    {
        $this->path = $path;

        return $this;
    }

    public function setVersion(string $version): self
    {
        $this->version = $version;

        return $this;
    }

    public function addParameter(string $parameter, $value): self
    {
        $this->parameters[$parameter] = $value;

        return $this;
    }

    public function get(): array
    {
        $this->prepareUri();

        $response = $this->client->get($this->uri, [
            'query' => $this->parameters,
        ]);

        return json_decode((string) $response->getBody(), true);
    }

    public function post(array $data): array
    {
        $this->prepareUri();

        $response = $this->client->post($this->uri, [
            'query' => $this->parameters,
            RequestOptions::JSON => $data,
        ]);

        return json_decode((string) $response->getBody(), true);
    }

    public function getOwnerForToken(string $token): ?string
    {
        return $this->setEndpoint('tokens')
            ->addParameter('access_token', $token)
            ->get()['token']['user'];
    }

    public function getStylesForToken(string $token): ?array
    {
        $owner = $this->getOwnerForToken($token);

        return $this->setVersion('v1')
            ->setEndpoint('styles')
            ->setPath($owner)
            ->addParameter('access_token', $token)
            ->get();
    }

    public function isValidToken(string $token, ?bool $isSecret = false): bool
    {
        if ($isSecret && 0 !== strpos($token, 'sk')) {
            return false;
        }

        if (!$isSecret && 0 !== strpos($token, 'pk')) {
            return false;
        }
        $code = $this->setEndpoint('tokens')
            ->addParameter('access_token', $token)
            ->get()['code'];

        return !\in_array($code, self::MAPBOX_INVALID_TOKEN_CODES, true);
    }

    private function prepareUri(): void
    {
        $this->uri = self::BASE_URL . '/';
        if ($this->endpoint) {
            $this->uri .= $this->endpoint . '/';
        }
        $this->uri .= $this->version . '/';

        if ($this->path) {
            $this->uri .= $this->path . '/';
        }
    }
}
