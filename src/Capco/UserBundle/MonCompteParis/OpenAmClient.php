<?php
namespace Capco\UserBundle\MonCompteParis;

use Http\Client\Common\HttpMethodsClient;
use Psr\Log\LoggerInterface;

class OpenAmClient
{
    public const COOKIE_NAME = 'mcpAuth';
    public const COOKIE_DOMAIN = '.paris.fr';
    
    // https://fr.lutece.paris.fr/fr/wiki/api-openam.html
    public const API_URL = 'https://moncompte.paris.fr/v69/json';
    // https://fr.lutece.paris.fr/fr/wiki/user-information.html
    public const API_INFORMATIONS_URL = 'https://moncompte.paris.fr/v69/json/users/';

    protected $cookie;
    protected $client;
    protected $logger;

    public function __construct(HttpMethodsClient $client, LoggerInterface $logger)
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
            $this->logger->critical('Error returned by'. self::API_URL, ['cookie' => $this->cookie, 'json' => $json]);
            throw new \RuntimeException('Error returned by'. self::API_URL);
        }

        if (false === $json['valid']) {
            $this->logger->critical('Token not valid returned by ' . self::API_URL, ['cookie' => $this->cookie, 'json' => $json]);
            throw new \RuntimeException('Token not valid.');
        }

        return $json['uid'];
    }

    public function logoutUser(): void
    {
        $url = sprintf('%s/sessions/?_action=logout', self::API_URL);
        $response = $this->client->post(
            $url,
            ['content-type' => 'application/json', 'mcpAuth' => $this->cookie],
            '{}'
        );
        $json = json_decode((string) $response->getBody(), true);

        if (isset($json['code']) && (400 >= $json['code'] && 500 <= $json['code'])) {
            $this->logger->critical('Error returned by '. $url, ['cookie' => $this->cookie, 'json' => $json]);
            throw new \RuntimeException('Error returned by '. $url);
        }
    }

    public function getUserInformations(string $email): array
    {
        $response = $this->client->get(self::API_INFORMATIONS_URL . $email, [
            'Cookie' => self::COOKIE_NAME . '=' . $this->cookie,
        ]);
        $json = json_decode((string) $response->getBody(), true);
        if (!$json) {
            $this->logger->critical('Error returned by '. self::API_INFORMATIONS_URL, ['cookie' => $this->cookie, 'email' => $email, 'json' => $json]);
            throw new \RuntimeException('Error returned by '. self::API_INFORMATIONS_URL);
        }

        return $json;
    }
}
