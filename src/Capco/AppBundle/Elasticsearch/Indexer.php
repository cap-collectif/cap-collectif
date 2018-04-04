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
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;

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

    protected $currentInsertBulk = [];

    protected $currentDeleteBulk = [];

    /**
     * @var EntityManager
     */
    private $em;

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
        $this->em = $registry->getManager();
        $this->serializer = $serializer;
    }

    /**
     * Fetch ALL the indexable entities and send them to bulks.
     *
     * @param null|mixed $output
     */
    public function indexAll(OutputInterface $output = null)
    {
        $classes = $this->getClassesToIndex();

        foreach ($classes as $class) {
            $repository = $this->em->getRepository($class);

            $query = $repository->createQueryBuilder('a')->getQuery();
            $iterableResult = $query->iterate();

            if ($output) {
                $count = $repository->createQueryBuilder('a')->select('count(a)')->getQuery()->getSingleScalarResult();
                $output->writeln(PHP_EOL . '<info>' . 'Indexing ' . $count . ' ' . $class . '</info>');
                $progress = new ProgressBar($output, $count);
                $progress->start();
            }

            foreach ($iterableResult as $row) {
                /** @var IndexableInterface $object */
                $object = $row[0];

                if ($object->isIndexable()) {
                    $document = $this->buildDocument($object);
                    $this->addToBulk($document);
                } else {
                    // Empty mean DELETE
                    $this->addToBulk(new Document($object->getId(), [], $object->getElasticsearchTypeName()));
                }

                if (isset($progress)) {
                    $progress->advance();
                }
                $this->em->detach($row[0]);
            }
            if (isset($progress)) {
                $progress->finish();
            }
        }
    }

    /**
     * Reindex a specific entity.
     * You HAVE to call self::finishBulk after!
     *
     * @param mixed $identifier
     */
    public function index(string $entityFQN, $identifier)
    {
        $repository = $this->em->getRepository($entityFQN);
        $object = $repository->findOneBy(['id' => $identifier]);

        if ($object instanceof IndexableInterface) {
            $document = $this->buildDocument($object);
            $this->addToBulk($document);
        } else {
            $this->remove($entityFQN, $identifier);
        }
    }

    /**
     * Remove / Delete from the index.
     * You HAVE to call self::finishBulk after!
     *
     * @param mixed $identifier
     */
    public function remove(string $entityFQN, $identifier)
    {
        $classes = $this->getClassesToIndex();
        $type = array_search($entityFQN, $classes, true);

        $this->addToBulk(new Document($identifier, [], $type));
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

    /**
     * All the Doctrine classes implementing IndexableInterface.
     */
    public function getClassesToIndex(): array
    {
        if (!empty($this->classes)) {
            return $this->classes;
        }

        $this->classes = [];
        $metas = $this->em->getMetadataFactory()->getAllMetadata();
        foreach ($metas as $meta) {
            $interfaces = class_implements($meta->getName());
            if ($interfaces && in_array(IndexableInterface::class, $interfaces, true)) {
                $type = call_user_func($meta->getName() . '::getElasticsearchTypeName');
                $this->classes[$type] = $meta->getName();
            }
        }

        $this->classes['comment'] = "Capco\AppBundle\Entity\Comment";

        return $this->classes;
    }

    protected function buildDocument(IndexableInterface $object): Document
    {
        $context = SerializationContext::create();
        $context->setGroups($object::getElasticsearchSerializationGroups());
        $json = $this->serializer->serialize($object, 'json', $context);

        return new Document($object->getId(), $json, $object::getElasticsearchTypeName());
    }

    /**
     * Add a Document to the current bulk.
     * This does not send the bulk! /!\ (only if the threshold is hit).
     */
    private function addToBulk(Document $document)
    {
        $document->setIndex($this->index);

        if (!empty($document->getData())) {
            $this->currentInsertBulk[] = $document;
        } else {
            $this->currentDeleteBulk[] = $document;
        }

        if (count($this->currentInsertBulk) >= self::BULK_SIZE || count($this->currentDeleteBulk) >= self::BULK_SIZE) {
            $this->finishBulk();
        }
    }
}
