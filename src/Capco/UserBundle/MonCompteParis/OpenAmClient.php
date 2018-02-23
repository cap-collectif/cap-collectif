<?php

namespace Capco\UserBundle\MonCompteParis;

use Http\Client\HttpClient;

class OpenAmClient
{
    const COOKIE_NAME = 'mcpAuth'; // Iplanetdirectorypro in test env
    const COOKIE_DOMAIN = '.paris.fr';
    const API_URL = 'https://moncompte.paris.fr/v69/json/';

    protected $cookie = null;
    protected $client;

    public function __construct(HttpClient $client)
    {
        $this->client = $client;
    }

    public function setCookie(string $cookie)
    {
        $this->cookie = $cookie;
    }

    public function getUid(): string
    {
        $response = $this->client->post(self::API_URL . 'sessions/' . $this->cookie . '?_action=validate', ['Content-Type: application/json']);
        $json = json_decode((string) $response->getBody(), true);

        if (false === $json['valid']) {
            throw new \Exception('Token not valid.');
        }

        return $json['uid'];
    }

    // OR http://fr.lutece.paris.fr/fr/wiki/gru-appeldirect-identitystore.html
    public function getUserInformations(string $uid): array
    {
        $response = $this->client->get(self::API_URL . 'users/' . $uid, [self::COOKIE_NAME . ': ' . $this->cookie]);
        $json = json_decode((string) $response->getBody(), true);

        return [
          'username' => $json['username'],
          'mail' => $json['mail'][0],
        ];
    }
}
