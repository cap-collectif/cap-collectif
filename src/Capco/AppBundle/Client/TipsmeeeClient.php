<?php

namespace Capco\AppBundle\Client;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class TipsmeeeClient
{
    private LoggerInterface $logger;
    private string $apiKey;
    private HttpClientInterface $client;

    public function __construct(
        HttpClientInterface $tipsmeeeClient,
        LoggerInterface $logger,
        string $apiKey
    ) {
        $this->client = $tipsmeeeClient;
        $this->apiKey = $apiKey;
        $this->logger = $logger;
    }

    public function getAllAccounts(): array
    {
        try {
            $accounts = $this->makeRequest('GET', 'capco');

            return $accounts->toArray();
        } catch (TransportException | ClientExceptionInterface | DecodingExceptionInterface | RedirectionExceptionInterface | ServerExceptionInterface  $exception) {
            $this->logger->error(__METHOD__.' : '.$exception->getMessage());

            return [];
        }
    }

    public function getAccountById(string $accountId): array
    {
        try {
            $account = $this->makeRequest('GET', "capco/user/${accountId}/");


            return $account->toArray();
        } catch (TransportException | ClientExceptionInterface | DecodingExceptionInterface | RedirectionExceptionInterface | ServerExceptionInterface $exception) {
            $this->logger->error(__METHOD__.' : '.$exception->getMessage());

            return [];
        }
    }

    private function makeRequest(string $method, string $path): ResponseInterface
    {
        $options = [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'query' => [
                'tm_capco' => $this->apiKey,
            ],
        ];

        try {
            return $this->client->request($method, $path, $options);
        } catch (TransportExceptionInterface $exception) {
            $this->logger->error('Wrong query parameters.'.__METHOD__.$exception->getMessage());

            throw new TransportException($exception->getMessage());
        }
    }
}
