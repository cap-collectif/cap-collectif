<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Cache\RedisCache;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Component\HttpClient\Exception\ServerException;

class APIEnterpriseAutoCompleteUtils
{
    public const HEADERS = [
        'Content-Type' => 'application/json',
    ];

    public const BODY = [
        'context' => 'aides publiques',
        'recipient' => '23750007900312',
        'object' => 'budgetparticipatif',
    ];
    private $cache;
    private $logger;

    public function __construct(RedisCache $cache, LoggerInterface $logger)
    {
        $this->cache = $cache;
        $this->logger = $logger;
    }

    public function cancelRequest(?ResponseInterface $response): void
    {
        try {
            if ($response) {
                $response->cancel();
            }
            unset($response);
        } catch (TransportExceptionInterface | ClientExceptionInterface | ServerException $e) {
        }
    }

    public function accessRequestObjectSafely(?ResponseInterface $response): ?array
    {
        if (!isset($response)) {
            $this->logger->warning('API entreprise accessing null response.');

            return null;
        }

        try {
            if (200 !== $response->getStatusCode()) {
                return null;
            }

            // casts the response JSON contents to a PHP array
            return $response->toArray();
        } catch (TransportExceptionInterface | ClientExceptionInterface | ServerException $e) {
            $this->logger->error('API entreprise error. ' . $e->getMessage());

            return null;
        }
    }

    public function makeGetRequest(
        HttpClientInterface $client,
        string $url,
        int $timeout = 5
    ): ?ResponseInterface {
        try {
            return $client->request('GET', $url, [
                'headers' => self::HEADERS,
                'query' => self::BODY,
                'timeout' => $timeout,
            ]);
        } catch (TransportExceptionInterface | ClientExceptionInterface | ServerException $e) {
            $this->logger->error('API entreprise error. ' . $e->getMessage());

            return null;
        }
    }

    public function formatAddressFromJSON(array $jsonAddress): string
    {
        $name = isset($jsonAddress['l1']) ? $jsonAddress['l1'] . ' ' : '';
        $street = isset($jsonAddress['l4']) ? $jsonAddress['l4'] . ' ' : '';
        $postalCode = isset($jsonAddress['l6']) ? $jsonAddress['l6'] . ' ' : '';
        $country = $jsonAddress['l7'] ?? '';

        return $name . $street . $postalCode . $country;
    }

    public function formatTurnoverFromJSON(array $jsonTurnover): string
    {
        $strTurnover = '';
        foreach ($jsonTurnover as $entry) {
            $ca = isset($entry['ca']) ? 'Chiffre d\'affaire : ' . $entry['ca'] . ' ' : '';
            $end = isset($entry['date_fin_exercice'])
                ? 'Fin d\'exercice : ' . $entry['date_fin_exercice'] . ' '
                : '';
            $endTimeStamp = isset($entry['date_fin_exercice'])
                ? 'Fin d\'exercice : ' . $entry['date_fin_exercice'] . ' '
                : '';
            $strTurnover = $strTurnover . $ca . $end . $endTimeStamp . "\n";
        }

        return $strTurnover;
    }

    public function saveInCache(string $key, array $data, int $duration = RedisCache::ONE_DAY): void
    {
        $cachedItem = $this->cache->getItem($key);
        $cachedItem->set($data)->expiresAfter($duration);
        $this->cache->save($cachedItem);
    }
}
