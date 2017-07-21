<?php

namespace Capco\AppBundle\Elasticsearch;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\ORM\EntityManager;
use Elastica\Bulk;
use Elastica\Client;
use Elastica\Document;
use Elastica\Index;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\SerializerInterface;

/**
 * Handle indexation of entities.
 * This service is STATEFUL!
 */
class Indexer
{
    const BULK_SIZE = 100;

    /**
     * @var Index
     */
    protected $index;

    /**
     * @var Client
     */
    protected $client;

    /**
     * @var Registry
     */
    private $registry;

    /**
     * @var EntityManager
     */
    private $em;

    /**
     * @var array
     */
    protected $currentInsertBulk = [];

    /**
     * @var array
     */
    protected $currentDeleteBulk = [];

    /**
     * @var SerializerInterface
     */
    private $serializer;

    /**
     * @var array
     */
    private $classes;

    public function __construct(Registry $registry, SerializerInterface $serializer, Index $index)
    {
        $this->index = $index;
        $this->client = $index->getClient();
        $this->registry = $registry;
        $this->em = $registry->getManager();
        $this->serializer = $serializer;
    }

    public function indexAll()
    {
        $classes = $this->getClassesToIndex();

        foreach ($classes as $class) {
            $repository = $this->em->getRepository($class);

            $query = $repository->createQueryBuilder('a')->getQuery();
            $iterableResult = $query->iterate();

            foreach ($iterableResult as $row) {
                /** @var IndexableInterface $object */
                $object = $row[0];

                if ($object->isIndexable()) {
                    $context = SerializationContext::create();
                    $context->setGroups($object->getElasticsearchSerializationGroups());
                    $json = $this->serializer->serialize($object, 'json', $context);

                    $document = new Document($object->getId(), $json, $object->getElasticsearchTypeName());
                    $this->addToBulk($document);
                } else {
                    // Empty mean DELETE
                    $this->addToBulk(new Document($object->getId(), [], $object->getElasticsearchTypeName()));
                }

                $this->em->detach($row[0]);
            }
        }
    }

    /**
     * All the Doctrine classes implementing IndexableInterface
     * @return array
     */
    public function getClassesToIndex()
    {
        if (!empty($this->classes)) {
            return $this->classes;
        }

        $this->classes = array();
        $metas = $this->em->getMetadataFactory()->getAllMetadata();
        foreach ($metas as $meta) {
            $interfaces = class_implements($meta->getName());
            if($interfaces && in_array(IndexableInterface::class, $interfaces)) {
                $type = call_user_func($meta->getName() .'::getElasticsearchTypeName');
                $this->classes[$type] = $meta->getName();
            }
        }

        return $this->classes;
    }

    public function index($entityFQN, $identifier)
    {
        // @todo check type=false

    }

    public function remove($entityFQN, $identifier)
    {

    }

    /**
     * Add a Document to the current bulk.
     * This does not send the bulk! /!\ (only if the threshold is hit).
     *
     * @param Document     $document
     * @param Index|string $index
     */
    private function addToBulk(Document $document, $index = null)
    {
        if ($index) {
            $document->setIndex($index instanceof Index ? $index->getName() : $index);
        } else {
            $document->setIndex($this->index);
        }

        if (!empty($document->getData())) {
            $this->currentInsertBulk[] = $document;
        } else {
            $this->currentDeleteBulk[] = $document;
        }

        if (count($this->currentInsertBulk) >= self::BULK_SIZE || count($this->currentDeleteBulk) >= self::BULK_SIZE) {
            $this->finishBulk();
        }
    }

    /**
     * To call to flush everything still in the pending Bulk.
     * We do two different calls because we ignore 404 for DELETE operations,
     * but zero tolerance for error on UPSERT.
     */
    public function finishBulk()
    {
        if (count($this->currentInsertBulk) > 0) {
            $bulk = new Bulk($this->client);
            $bulk->addDocuments($this->currentInsertBulk);
            $response = $bulk->send();
            if ($response->hasError()) {
                throw new \RuntimeException($response->getFullError());
            }
        }

        if (count($this->currentDeleteBulk) > 0) {
            $bulk = new Bulk($this->client);
            $bulk->addDocuments($this->currentDeleteBulk, Bulk\Action::OP_TYPE_DELETE);
            $response = $bulk->send();
            if ($response->hasError()) {
                throw new \RuntimeException($response->getFullError());
            }
        }

        $this->currentInsertBulk = [];
        $this->currentDeleteBulk = [];
    }
}
