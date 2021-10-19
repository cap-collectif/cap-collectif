<?php

namespace Capco\UserBundle\Security\Service;

use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;

/**
 * Class CasUserFilter
 *
 */
class CasUserFilter
{
    const COLLABORATOR_LABEL = 'C';
    const ELECTED_LABEL = 'E';
    /**
     * @var Client
     */
    private Client $client;

    /**
     * @var LoggerInterface
     */
    private LoggerInterface $logger;

    /**
     * @var string
     */
    private string $url;

    /**
     * @param LoggerInterface $logger
     * @param string $url
     */
    public function __construct(LoggerInterface $logger, string $url)
    {
        $this->client = new Client();
        $this->logger = $logger;
        $this->url = $url;
    }

    /**
     * @param string $username
     * @return bool
     */
    public function isNotAuthorizedCasUserProfile(string $username): bool
    {
        try {
            $response = $this->client->post( $this->url, [
                'headers' => [
                    'Content-Type' => 'application/xml'
                ],
                'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
                'body' => '<IdentificationRequest>
                              <login>'.$username.'</login>
                          </IdentificationRequest>'

            ]);

            $attributes = json_decode(json_encode(simplexml_load_string($response->getBody()->getContents())),true);
            if(key_exists('role', $attributes) && !in_array($attributes['role'], [self::COLLABORATOR_LABEL, self::ELECTED_LABEL]))
            {
                return true;
            }

            return false;

        } catch (TransportException | ClientExceptionInterface | DecodingExceptionInterface | RedirectionExceptionInterface | ServerExceptionInterface $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            return false;
        }
    }

}