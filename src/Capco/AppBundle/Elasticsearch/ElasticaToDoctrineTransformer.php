<?php

namespace Capco\AppBundle\Elasticsearch;

use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Elastica\Result;
use Psr\Log\LoggerInterface;
use Symfony\Component\PropertyAccess\PropertyAccessorInterface;

/**
 * Maps Elastica documents with Doctrine objects
 * This mapper assumes an exact match between
 * elastica documents ids and doctrine object ids.
 *
 * Inspired by https://github.com/FriendsOfSymfony/FOSElasticaBundle/blob/795e6dc24be1cffb609b61e6b6ddd9e63eb38153/Doctrine/ORM/ElasticaToModelTransformer.php
 * Rewritten to handle multiple types.
 */
class ElasticaToDoctrineTransformer
{
    final public const ENTITY_ALIAS = 'o';

    protected $registry;

    /**
     * Optional parameters.
     */
    protected $options = [
        'hints' => [],
        'hydrate' => true,
        'identifier' => 'id',
        'ignore_missing' => true,
        'query_builder_method' => 'createQueryBuilder',
    ];

    /**
     * @var PropertyAccessorInterface
     */
    protected $propertyAccessor;

    public function __construct(
        ManagerRegistry $registry,
        private readonly Indexer $indexer,
        private readonly LoggerInterface $logger
    ) {
        $this->registry = $registry;
    }

    /**
     * Transforms an array of elastica objects into an array of
     * model objects fetched from the doctrine repository.
     *
     * @throws \RuntimeException
     */
    public function transform(array $elasticaObjects): array
    {
        $objects = $ids = $toFetchByType = [];
        /** @var Result $elasticaObject */
        foreach ($elasticaObjects as $elasticaObject) {
            list($type, $id) = explode(':', $elasticaObject->getId());

            if (!$type || !$id) {
                throw new \RuntimeException("Id format for current document is not type:id, can't hydrate to Doctrine!");
            }
            $ids[] = $type . '#' . $id;
            $toFetchByType[$type][] = $id;
        }

        foreach ($toFetchByType as $type => $toFetchIds) {
            $objectClass = $this->getObjectClassFromType($type);
            $objects = array_merge(
                $objects,
                $this->findByIdentifiers($toFetchIds, $this->options['hydrate'], $objectClass)
            );
        }

        $objectsCnt = \count($objects);
        $elasticaObjectsCnt = \count($elasticaObjects);
        if ($objectsCnt < $elasticaObjectsCnt) {
            $error = sprintf(
                'Cannot find corresponding Doctrine objects (%d) for all Elastica results (%d). IDs: %s',
                $objectsCnt,
                $elasticaObjectsCnt,
                implode(', ', $ids)
            );

            if (!$this->options['ignore_missing']) {
                throw new \RuntimeException($error);
            }

            $this->logger->error($error);
        }

        $propertyAccessor = $this->propertyAccessor;
        $identifier = $this->getIdentifierField();

        // sort objects in the order of ids
        $idPos = array_flip($ids);
        usort($objects, function ($a, $b) use ($idPos, $identifier, $propertyAccessor) {
            if ($this->options['hydrate']) {
                return $idPos[
                    $a::getElasticsearchTypeName() .
                        '#' .
                        $propertyAccessor->getValue($a, $identifier)
                ] >
                    $idPos[
                        $b::getElasticsearchTypeName() .
                            '#' .
                            $propertyAccessor->getValue($b, $identifier)
                    ];
            }

            return $idPos[$a[$identifier]] > $idPos[$b[$identifier]];
        });

        return $objects;
    }

    public function hybridTransform(array $elasticaObjects): array
    {
        $indexedElasticaResults = [];
        foreach ($elasticaObjects as $elasticaObject) {
            $indexedElasticaResults[$elasticaObject->getId()] = $elasticaObject;
        }
        $objects = $this->transform($elasticaObjects);
        $result = [];
        foreach ($objects as $object) {
            if ($this->options['hydrate']) {
                $id = $this->propertyAccessor->getValue($object, $this->getIdentifierField());
            } else {
                $id = $object[$this->getIdentifierField()];
            }
            $result[] = new HybridResult(
                $indexedElasticaResults[sprintf('%s:%s', $object::getElasticsearchTypeName(), $id)],
                $object
            );
        }

        return $result;
    }

    public function setPropertyAccessor(PropertyAccessorInterface $propertyAccessor): void
    {
        $this->propertyAccessor = $propertyAccessor;
    }

    /**
     * Fetch objects for theses identifier values.
     */
    protected function findByIdentifiers(
        array $identifierValues,
        bool $hydrate,
        mixed $objectClass
    ): array {
        if (empty($identifierValues)) {
            return [];
        }
        $hydrationMode = $hydrate ? Query::HYDRATE_OBJECT : Query::HYDRATE_ARRAY;

        $qb = $this->getEntityQueryBuilder($objectClass);
        $qb->andWhere(
            $qb->expr()->in(static::ENTITY_ALIAS . '.' . $this->getIdentifierField(), ':values')
        )->setParameter('values', $identifierValues);

        $query = $qb->getQuery();

        foreach ($this->options['hints'] as $hint) {
            $query->setHint($hint['name'], $hint['value']);
        }

        return $query->setHydrationMode($hydrationMode)->execute();
    }

    /**
     * Retrieves a query builder to be used for querying by identifiers.
     */
    protected function getEntityQueryBuilder(mixed $objectClass): QueryBuilder
    {
        $repository = $this->registry
            ->getManagerForClass($objectClass)
            ->getRepository($objectClass)
        ;

        return $repository->{$this->options['query_builder_method']}(static::ENTITY_ALIAS);
    }

    /**
     * Returns a sorting closure to be used with usort() to put retrieved objects
     * back in the order that they were returned by ElasticSearch.
     */
    protected function getSortingClosure(array $idPos, string $identifierPath): callable
    {
        $propertyAccessor = $this->propertyAccessor;

        return function ($a, $b) use ($idPos, $identifierPath, $propertyAccessor) {
            return $idPos[(string) $propertyAccessor->getValue($a, $identifierPath)] >
                $idPos[(string) $propertyAccessor->getValue($b, $identifierPath)];
        };
    }

    private function getIdentifierField()
    {
        return $this->options['identifier'];
    }

    private function getObjectClassFromType($type): string
    {
        $classes = $this->indexer->getClassesToIndex();

        if (isset($classes[$type])) {
            return $classes[$type];
        }

        throw new \Exception(sprintf("Can't find the Doctrine class for Elastic document of type '%s'", $type));
    }
}
