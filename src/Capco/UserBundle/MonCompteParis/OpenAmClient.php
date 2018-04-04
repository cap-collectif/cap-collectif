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
    protected $logger;

    public function __construct(HttpClient $client, $logger)
    {
        $this->client = $client;
        $this->logger = $logger;
    }

    public function setCookie(string $cookie)
    {
        $this->cookie = $cookie;
    }

    public function getUid(): string
    {
        $response = $this->client->post(self::API_URL . 'sessions/' . $this->cookie . '?_action=validate', ['content-type' => 'application/json'], '{}');
        $json = json_decode((string) $response->getBody(), true);

        if (isset($json['code']) && 500 === $json['code']) {
            $this->logger->critical('Error returned by moncompte.paris.fr', ['json' => $json]);
            throw new \RuntimeException('Error returned by moncompte.paris.fr.');
        }

        if (false === $json['valid']) {
            $this->logger->critical('Token not valid returned by moncompte.paris.fr.');
            throw new \RuntimeException('Token not valid.');
        }

        return $json['uid'];
    }
}
