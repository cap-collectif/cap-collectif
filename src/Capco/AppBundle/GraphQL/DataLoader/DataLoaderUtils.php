<?php

namespace Capco\AppBundle\GraphQL\DataLoader;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;

class DataLoaderUtils
{
    /**
     * Method soon deprecated once using ElasticSearch.
     */
    public static function getAfterOffset(array &$results, array $key): void
    {
        $offsetCurrent = $key['args']['after'] ?? null;
        if (null !== $offsetCurrent) {
            $i = 0;
            $offsetCurrent = GlobalIdResolver::getDecodedId($offsetCurrent)['id'];
            foreach ($results as $result) {
                ++$i;
                if ($result->getId() === $offsetCurrent) {
                    break;
                }
            }
            $results = \array_slice($results, $i);
        }
    }

    /**
     * Method soon deprecated once using ElasticSearch.
     */
    public static function getBeforeOffset(array &$results, array $key): void
    {
        $offsetCurrent = $key['args']['before'] ?? null;
        $limit = $key['args']['first'] ?? null;
        if (null !== $offsetCurrent) {
            $i = 0;
            $offsetCurrent = GlobalIdResolver::getDecodedId($offsetCurrent)['id'];
            foreach ($results as $result) {
                if ($result->getId() === $offsetCurrent) {
                    break;
                }
                ++$i;
            }
            if (null === $limit) {
                $limit = 100;
            }
            $results =
                $i - $limit > 0
                    ? \array_slice($results, $i - $limit, $i)
                    : \array_slice($results, 0, $i);
        }
    }
}
