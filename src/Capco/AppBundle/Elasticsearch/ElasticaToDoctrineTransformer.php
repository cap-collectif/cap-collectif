<?php

namespace Capco\AppBundle\Elasticsearch;

use Doctrine\ORM\Query;
use Doctrine\Common\Persistence\ManagerRegistry;
use Elastica\Result;
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
    const ENTITY_ALIAS = 'o';

    /**
     * Manager registry.
     *
     * @var ManagerRegistry
     */
    protected $registry = null;

    /**
     * Optional parameters.
     *
     * @var array
     */
    protected $options = [
        'hints' => [],
        'hydrate' => true,
        'identifier' => 'id',
        'ignore_missing' => true,
        'query_builder_method' => 'createQueryBuilder',
    ];

    /**
     * PropertyAccessor instance.
     *
     * @var PropertyAccessorInterface
     */
    protected $propertyAccessor;

    /**
     * @var Indexer
     */
    private $indexer;

    /**
     * Instantiates a new Mapper.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry, Indexer $indexer)
    {
        $this->registry = $registry;
        $this->indexer = $indexer;
    }

    /**
     * Transforms an array of elastica objects into an array of
     * model objects fetched from the doctrine repository.
     *
     * @param array $elasticaObjects of elastica objects
     *
     * @throws \RuntimeException
     *
     * @return array
     **/
    public function transform(array $elasticaObjects)
    {
        $objects = $ids = $toFetchByType = [];
        /** @var Result $elasticaObject */
        foreach ($elasticaObjects as $elasticaObject) {
            dump($elasticaObject);
            $ids[] = $elasticaObject->getType(). '#' .$elasticaObject->getId();
            $toFetchByType[$elasticaObject->getType()][] = $elasticaObject->getId();
        }

        foreach ($toFetchByType as $type => $toFetchIds) {
            $objectClass = $this->getObjectClassFromType($type);
            $objects = array_merge($objects, $this->findByIdentifiers($toFetchIds, $this->options['hydrate'], $objectClass));
        }

        $objectsCnt = count($objects);
        $elasticaObjectsCnt = count($elasticaObjects);
        if (!$this->options['ignore_missing'] && $objectsCnt < $elasticaObjectsCnt) {
            throw new \RuntimeException(sprintf('Cannot find corresponding Doctrine objects (%d) for all Elastica results (%d). IDs: %s', $objectsCnt, $elasticaObjectsCnt, implode(', ', $ids)));
        }

        $propertyAccessor = $this->propertyAccessor;
        $identifier = $this->options['identifier'];

        // sort objects in the order of ids
        $idPos = array_flip($ids);
        dump($idPos);
        usort(
            $objects,
            function ($a, $b) use ($idPos, $identifier, $propertyAccessor) {
                if ($this->options['hydrate']) {
                    return $idPos[$a::getElasticsearchTypeName() .'#'. (string) $propertyAccessor->getValue($a, $identifier)]
                        > $idPos[$b::getElasticsearchTypeName() .'#'. (string) $propertyAccessor->getValue($b, $identifier)];
                }

                return $idPos[$a[$identifier]] > $idPos[$b[$identifier]];
            }
        );

        return $objects;
    }

    public function hybridTransform(array $elasticaObjects)
    {
        $indexedElasticaResults = [];
        foreach ($elasticaObjects as $elasticaObject) {
            $indexedElasticaResults[(string) $elasticaObject->getId()] = $elasticaObject;
        }
        $objects = $this->transform($elasticaObjects);
        $result = [];
        foreach ($objects as $object) {
            if ($this->options['hydrate']) {
                $id = $this->propertyAccessor->getValue($object, $this->options['identifier']);
            } else {
                $id = $object[$this->options['identifier']];
            }
            $result[] = new HybridResult($indexedElasticaResults[(string) $id], $object);
        }
        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function getIdentifierField()
    {
        return $this->options['identifier'];
    }

    /**
     * Fetch objects for theses identifier values.
     *
     * @param array $identifierValues ids values
     * @param bool $hydrate whether or not to hydrate the objects, false returns arrays
     * @param $objectClass
     *
     * @return array of objects or arrays
     */
    protected function findByIdentifiers(array $identifierValues, $hydrate, $objectClass)
    {
        if (empty($identifierValues)) {
            return [];
        }
        $hydrationMode = $hydrate ? Query::HYDRATE_OBJECT : Query::HYDRATE_ARRAY;

        $qb = $this->getEntityQueryBuilder($objectClass);
        $qb->andWhere($qb->expr()->in(static::ENTITY_ALIAS.'.'.$this->options['identifier'], ':values'))
            ->setParameter('values', $identifierValues);

        $query = $qb->getQuery();

        foreach ($this->options['hints'] as $hint) {
            $query->setHint($hint['name'], $hint['value']);
        }

        return $query->setHydrationMode($hydrationMode)->execute();
    }

    /**
     * Retrieves a query builder to be used for querying by identifiers.
     *
     * @param $objectClass
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getEntityQueryBuilder($objectClass)
    {
        $repository = $this->registry
            ->getManagerForClass($objectClass)
            ->getRepository($objectClass);

        return $repository->{$this->options['query_builder_method']}(static::ENTITY_ALIAS);
    }

    /**
     * Set the PropertyAccessor instance.
     *
     * @param PropertyAccessorInterface $propertyAccessor
     */
    public function setPropertyAccessor(PropertyAccessorInterface $propertyAccessor)
    {
        $this->propertyAccessor = $propertyAccessor;
    }

    /**
     * Returns a sorting closure to be used with usort() to put retrieved objects
     * back in the order that they were returned by ElasticSearch.
     *
     * @param array  $idPos
     * @param string $identifierPath
     *
     * @return callable
     */
    protected function getSortingClosure(array $idPos, $identifierPath)
    {
        $propertyAccessor = $this->propertyAccessor;
        return function ($a, $b) use ($idPos, $identifierPath, $propertyAccessor) {
            return $idPos[(string) $propertyAccessor->getValue($a, $identifierPath)] > $idPos[(string) $propertyAccessor->getValue($b, $identifierPath)];
        };
    }

    /**
     * @param $type
     * @return string
     *
     * @throws \Exception
     */
    private function getObjectClassFromType($type)
    {
        $classes = $this->indexer->getClassesToIndex();

        if (isset($classes[$type])) {
            return $classes[$type];
        } else {
            throw new \Exception(sprintf("Can't find the Doctrine class for Elastic document of type '%s'", $type));
        }
    }
}
