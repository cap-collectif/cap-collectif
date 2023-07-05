<?php

namespace Capco\UserBundle\Security\Service;

use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;
use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;

/**
 * Class CapebUserFilter.
 */
class CapebUserFilter
{
    public const COLLABORATOR_LABEL = 'C';
    public const ELECTED_LABEL = 'E';

    private Client $client;
    private LoggerInterface $logger;
    private UserTypeRepository $userTypeRepository;
    private ?string $url = null;

    public function __construct(LoggerInterface $logger, UserTypeRepository $userTypeRepository, ?string $url)
    {
        $this->client = new Client();
        $this->logger = $logger;
        $this->userTypeRepository = $userTypeRepository;
        $this->url = $url;
    }

    public function getUserType(string $username): ?UserType
    {
        if (!$this->url) {
            return null;
        }

        try {
            $response = $this->client->post($this->url, [
                'headers' => [
                    'Content-Type' => 'application/xml',
                ],
                'auth' => [
                    getenv('SYMFONY_CAPCAPEB_CAS_USER'),
                    getenv('SYMFONY_CAPCAPEB_CAS_PASSWORD'),
                ],
                'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
                'body' => '<IdentificationRequest>
                              <login>' . $username . '</login>
                          </IdentificationRequest>',
            ]);

            $attributes = json_decode(json_encode(simplexml_load_string($response->getBody()->getContents())), true);
            if (!\array_key_exists('role', $attributes)) {
                return null;
            }
            $userRole = $attributes['role'];
            if (self::COLLABORATOR_LABEL === $userRole) {
                return $this->userTypeRepository->findOneBySlug('collaborateur');
            }
            if (self::ELECTED_LABEL === $userRole) {
                return $this->userTypeRepository->findOneBySlug('elu');
            }

            $this->logger->error('Cas user "' . $username . '" has not authorized role : ' . $userRole);

            return null;
        } catch (TransportException|ClientExceptionInterface|DecodingExceptionInterface|RedirectionExceptionInterface|ServerExceptionInterface $exception) {
            $this->logger->error('Cas user "' . $username . '" api request failed');
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            return null;
        }
    }
}
