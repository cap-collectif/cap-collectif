<?php

namespace Capco\AppBundle\Client;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;

class MapboxClient
{
    private const BASE_URL = 'https://api.mapbox.com';

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
