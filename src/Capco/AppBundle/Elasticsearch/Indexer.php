<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Entity\Comment;
use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\ORM\EntityManager;
use Elastica\Bulk;
use Elastica\Client;
use Elastica\Document;
use Elastica\Index;
use Symfony\Component\Serializer\SerializerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Handle indexation of entities.
 * This service is STATEFUL!
 */
class Indexer
{
    public const BULK_SIZE = 100;

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
    private $logger;

    public function __construct(
        Registry $registry,
        SerializerInterface $serializer,
        Index $index,
        LoggerInterface $logger
    ) {
        $this->index = $index;
        $this->client = $index->getClient();
        $this->em = $registry->getManager();
        $this->serializer = $serializer;
        $this->logger = $logger;
    }

    /**
     * Fetch ALL the indexable entities and send them to bulks.
     */
    public function indexAll(OutputInterface $output = null): void
    {
        $classes = $this->getClassesToIndex();

        $classesOrdered = array_values($classes);
        usort($classesOrdered, function ($a, $b) {
            return \call_user_func($a . '::getElasticsearchPriority') >
                \call_user_func($b . '::getElasticsearchPriority');
        });

        foreach ($classesOrdered as $class) {
            $this->indexType($class, 0, $output);
        }
    }

    public function indexAllForType(string $type, int $offset, OutputInterface $output = null): void
    {
        $classes = $this->getClassesToIndex();

        $this->indexType($classes[$type], $offset, $output);
    }

    /**
     * Reindex a specific entity.
     * You HAVE to call self::finishBulk after!
     *
     * @param mixed $identifier
     */
    public function index(string $entityFQN, $identifier): void
    {
        $repository = $this->em->getRepository($entityFQN);
        $object = $repository->findOneBy(['id' => $identifier]);
        if (!$object instanceof IndexableInterface) {
            return;
        }
        if ($object->isIndexable()) {
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
    public function remove(string $entityFQN, $identifier): void
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
    public function finishBulk(): void
    {
        if (\count($this->currentInsertBulk) > 0) {
            $bulk = new Bulk($this->client);
            $bulk->addDocuments($this->currentInsertBulk);
            $response = $bulk->send();
            if ($response->hasError()) {
                throw new \RuntimeException($response->getFullError());
            }
        }

        if (\count($this->currentDeleteBulk) > 0) {
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
            if ($interfaces && \in_array(IndexableInterface::class, $interfaces, true)) {
                $type = \call_user_func($meta->getName() . '::getElasticsearchTypeName');
                $this->classes[$type] = $meta->getName();
            }
        }

        $this->classes['comment'] = Comment::class;

        return $this->classes;
    }

    public function setIndex(Index $index): self
    {
        $this->index = $index;

        return $this;
    }

    protected function buildDocument(IndexableInterface $object): Document
    {
        $json = [];

        try {
            $json = $this->serializer->serialize($object, 'json', ['groups' => ['Elasticsearch']]);
        } catch (\Exception $exception) {
            $this->logger->error(__METHOD__ . $exception->getMessage());
        }

        return new Document($object->getId(), $json, $object::getElasticsearchTypeName());
    }

    private function indexType(string $class, int $offset, OutputInterface $output = null): void
    {
        $repository = $this->em->getRepository($class);

        $query = $repository->createQueryBuilder('a')->getQuery();
        $iterableResult = $query->iterate();

        if ($output) {
            $count = $repository
                ->createQueryBuilder('a')
                ->select('count(a)')
                ->getQuery()
                ->getSingleScalarResult();
            $output->writeln(PHP_EOL . "<info> Indexing ${count} ${class}</info>");
            $progress = new ProgressBar($output, $count);
            $progress->start();
        }

        foreach ($iterableResult as $key => $row) {
            if ($key < $offset) {
                if (isset($progress)) {
                    $progress->advance();
                }

                continue;
            }
            /** @var IndexableInterface $object */
            $object = $row[0];

            if ($object->isIndexable()) {
                $document = $this->buildDocument($object);
                $this->addToBulk($document);
            } else {
                // Empty mean DELETE
                $this->addToBulk(
                    new Document($object->getId(), [], $object::getElasticsearchTypeName())
                );
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

    /**
     * Add a Document to the current bulk.
     * This does not send the bulk! /!\ (only if the threshold is hit).
     */
    private function addToBulk(Document $document): void
    {
        $document->setIndex($this->index);

        if (!empty($document->getData())) {
            $this->currentInsertBulk[] = $document;
        } else {
            $this->currentDeleteBulk[] = $document;
        }

        if (
            \count($this->currentInsertBulk) >= self::BULK_SIZE ||
            \count($this->currentDeleteBulk) >= self::BULK_SIZE
        ) {
            $this->finishBulk();
        }
    }
}
