<?php

namespace Capco\UserBundle\Security\Service;

use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;

/**
 * Class CapebUserFilter
 *
 */
class CapebUserFilter
{
    const COLLABORATOR_LABEL = 'C';
    const ELECTED_LABEL = 'E';

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
                    'Content-Type' => 'application/xml'
                ],
                'auth' => [
                    getEnv('SYMFONY_CAPCAPEB_CAS_USER'), 
                    getEnv('SYMFONY_CAPCAPEB_CAS_PASSWORD')
                ],
                'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
                'body' => '<IdentificationRequest>
                              <login>'.$username.'</login>
                          </IdentificationRequest>'
            ]);

            $attributes = json_decode(json_encode(simplexml_load_string($response->getBody()->getContents())),true);
            if (!key_exists('role', $attributes)) {
                 return null;
            }
            $userRole = $attributes['role'];
            if ($userRole === self::COLLABORATOR_LABEL) {
                return $this->userTypeRepository->findOneBySlug('collaborateur');
            }
            if ($userRole === self::ELECTED_LABEL) {
                return $this->userTypeRepository->findOneBySlug('elu');
            }

            $this->logger->error('Cas user "'. $username . '" has not authorized role : ' . $userRole);
            return null;

        } catch (TransportException | ClientExceptionInterface | DecodingExceptionInterface | RedirectionExceptionInterface | ServerExceptionInterface $exception) {
            $this->logger->error('Cas user "'. $username . '" api request failed');
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            return null;
        }
    }

}
