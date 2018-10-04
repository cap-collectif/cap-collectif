<?php
namespace Capco\UserBundle\MonCompteParis;

use Http\Client\HttpClient;
use Psr\Log\LoggerInterface;

class OpenAmClient
{
    public const COOKIE_NAME = 'mcpAuth'; // Iplanetdirectorypro in test env
    public const COOKIE_DOMAIN = '.paris.fr';
    public const API_URL = 'https://moncompte.paris.fr/v69/json';
    public const API_INFORMATIONS_URL = 'https://moncompte.paris.fr/moncompte/rest/banner/api/1/informations';

    protected $cookie;
    protected $client;
    protected $logger;

    public function __construct(HttpClient $client, LoggerInterface $logger)
    {
        $this->client = $client;
        $this->logger = $logger;
    }

    public function setCookie(string $cookie): void
    {
        $this->cookie = $cookie;
    }

    public function getUid(): string
    {
        $response = $this->client->post(
            sprintf('%s/sessions/%s?_action=validate', self::API_URL, $this->cookie),
            ['content-type' => 'application/json'],
            '{}'
        );
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

    public function logoutUser(): void
    {
        $response = $this->client->post(
            sprintf('%s/sessions/?_action=logout', self::API_URL),
            ['content-type' => 'application/json', 'mcpAuth' => $this->cookie],
            '{}'
        );
        $json = json_decode((string) $response->getBody(), true);

        if (isset($json['code']) && (400 >= $json['code'] && 500 <= $json['code'])) {
            $this->logger->critical('Error returned by moncompte.paris.fr', ['json' => $json]);
            throw new \RuntimeException('Error returned by moncompte.paris.fr.');
        }
    }

    public function getUserInformations(): array
    {
        $response = $this->client->get(self::API_INFORMATIONS_URL, [
            'Cookie' => self::COOKIE_NAME . '=' . $this->cookie,
        ]);
        $json = json_decode((string) $response->getBody(), true);
        if ('OK' !== $json['status']) {
            $this->logger->critical('Error returned by moncompte.paris.fr', ['json' => $json]);
            throw new \RuntimeException('Error returned by moncompte.paris.fr.');
        }

        return $json['result'];
    }
}
