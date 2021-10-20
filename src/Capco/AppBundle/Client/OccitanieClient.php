<?php

namespace Capco\AppBundle\Client;

use GuzzleHttp\Client;

class OccitanieClient
{
    protected string $username;
    protected string $password;
    protected string $clientId;
    protected string $clientSecret;
    protected string $base_url;
    protected string $token_url;
    protected string $counter_url;

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

        $this->base_url = 'https://mon-compte-particulier.laregion.fr/auth/realms/mon-compte-particulier';
        if (getenv('SYMFONY_INSTANCE_NAME') == 'occitanie-test') {
            $this->base_url = 'https://www.laregioncitoyenne.fr/auth/realms/laregioncitoyenne';
        }
        
        $this->token_url = $this->base_url . '/protocol/openid-connect/token';
        $this->counter_url = $this->base_url . '/get-user-by-platform/countallusers';
    }

    public function get(string $uri, string $token): int
    {
        $client = new Client([
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
            ],
        ]);
        $response = $client->get($uri, []);

        return json_decode((string) $response->getBody(), true);
    }

    public function post(string $uri, array $data): array
    {
        $client = new Client([
            'headers' => ['Content-Type' => 'application/json'],
        ]);
        $response = $client->post($uri, [
            'form_params' => $data,
        ]);

        return json_decode((string) $response->getBody(), true);
    }

    public function getUserCounters(): int
    {
        $tokenRequest = $this->post($this->token_url, [
            'grant_type' => 'password',
            'username' => $this->username,
            'password' => $this->password,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
        ]);

        if (!isset($tokenRequest['access_token'])) {
            throw new \RuntimeException('Token not valid.');
        }

        return $this->get($this->counter_url, $tokenRequest['access_token']);
    }
}
