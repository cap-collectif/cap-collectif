<?php

namespace Capco\AppBundle\Client;

class MapboxClient
{
    private const BASE_URL = 'https://api.mapbox.com';

    private $_client;
    private $_version = 'v2';
    private $_endpoint;
    private $_parameters = [];
    private $_uri;
    private $_path;

    private function prepareUri(): void
    {
        $this->_uri = self::BASE_URL . "/";
        if ($this->_endpoint) {
            $this->_uri .= $this->_endpoint . "/";
        }
        $this->_uri .= $this->_version . "/";

        if($this->_path) {
            $this->_uri .= $this->_path . "/";
        }
    }

    public function __construct()
    {
        $this->_client = new \GuzzleHttp\Client([
            'headers' => [ 'Content-Type' => 'application/json' ]
        ]);
    }

    public function endpoint(string $endpoint): self
    {
        $this->_endpoint = $endpoint;

        return $this;
    }

    public function path(string $path): self
    {
        $this->_path = $path;

        return $this;
    }

    public function version(string $version): self
    {
        $this->_version = $version;

        return $this;
    }

    public function addParameter(string $parameter, $value): self
    {
        $this->_parameters[$parameter] = $value;

        return $this;
    }

    public function get(): array
    {
        $this->prepareUri();

        $response = $this->_client->get($this->_uri, [
            'query' => $this->_parameters
        ]);

        return json_decode(
            (string)$response->getBody(),
            true
        );
    }


}
