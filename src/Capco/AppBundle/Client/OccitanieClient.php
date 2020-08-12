<?php

namespace Capco\AppBundle\Client;

use GuzzleHttp\Client;

class OccitanieClient
{
    public const BASE_URL = 'https://www.laregioncitoyenne.fr/auth/realms/laregioncitoyenne';
    public const TOKEN_URL = self::BASE_URL . '/protocol/openid-connect/token';
    public const COUNTER_URL = self::BASE_URL . '/get-user-by-platform/countallusers';

    protected string $username;
    protected string $password;
    protected string $clientId;
    protected string $clientSecret;

    public function __construct(
        string $username,
        string $password,
        string $clientId,
        string $clientSecret
    ) {
        $this->username = $username;
        $this->password = $password;
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
    }

    public function get(string $uri, string $token): int
    {
        $client = new Client([
                'headers' => ['Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
            ],
        ]);
        $response = $client->get($uri, []);

        return json_decode((string) $response->getBody(), true);
    }

    public function post(string $uri, array $data): array
    {
        $client = new Client([
                'headers' => ['Content-Type' => 'application/json'
            ],
        ]);
        $response = $client->post($uri, [
            'form_params' => $data
        ]);

        return json_decode((string) $response->getBody(), true);
    }

    public function getUserCounters(): int
    {
        $tokenRequest = $this->post(self::TOKEN_URL, [
            'grant_type' => 'password',
            'username' => $this->username,
            'password' => $this->password,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
        ]);

        if(!isset($tokenRequest["access_token"])) {
            throw new \RuntimeException('Token not valid.');
        }

        return $this->get(self::COUNTER_URL, $tokenRequest["access_token"]);
    }
}
