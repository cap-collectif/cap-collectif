<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Doctrine\ORM\EntityManager;
use Doctrine\Persistence\ManagerRegistry;
use Elastica\Bulk;
use Elastica\Client;
use Elastica\Document;
use Elastica\Index;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

/**
 * Handle indexation of entities.
 * This service is STATEFUL!
 */
class Indexer
{
    final public const BULK_SIZE = 100;

    /**
     * This attribute is used in a PhpSpec test.
     */
    public $currentDeleteBulk = [];

    /**
     * @var Index
     */
    protected $index;

    /**
     * @var Client
     */
    protected $client;

    protected $currentInsertBulk = [];

    /**
     * @var EntityManager
     */
    private $em;

    public function __construct(
        ManagerRegistry $registry,
        private readonly SerializerInterface $serializer,
        Index $index,
        private readonly LoggerInterface $logger,
        private readonly Stopwatch $stopwatch,
        private readonly IndexableTypesRegistry $indexableTypes
    ) {
        $this->index = $index;
        $this->client = $index->getClient();
        $this->em = $registry->getManager();
    }

    public function getIndex(): Index
    {
        return $this->index;
    }

    /**
     * Fetch ALL the indexable entities and send them to bulks.
     */
    public function indexAll(?OutputInterface $output = null, bool $isCli = false): void
    {
        $this->disableIndexingFilters();
        if ($isCli) {
            $this->getIndex()->setSettings(['index' => ['refresh_interval' => '-1']]);
        }

        $classes = $this->getClassesToIndex();

        $classesOrdered = array_values($classes);
        usort($classesOrdered, fn ($a, $b) => \call_user_func($a . '::getElasticsearchPriority')
            <=> \call_user_func($b . '::getElasticsearchPriority'));

        foreach ($classesOrdered as $class) {
            $this->indexType($class, 0, $output);
            // Later types compute counters by searching documents from earlier types.
            $this->getIndex()->refresh();
        }

        if ($isCli) {
            $this->getIndex()->setSettings(['index' => ['refresh_interval' => '1s']]);
            $this->index->forcemerge(['max_num_segments' => 5]);
        }
    }

    public function indexAllForType(
        string $type,
        int $offset,
        ?OutputInterface $output = null,
        bool $isCli = false
    ): void {
        $this->disableIndexingFilters();
        if ($isCli) {
            $this->getIndex()->setSettings(['index' => ['refresh_interval' => '-1']]);
        }

        $classes = $this->getClassesToIndex();
        $this->indexType($classes[$type], $offset, $output);
        $this->getIndex()->refresh();
        if ($isCli) {
            $this->getIndex()->setSettings(['index' => ['refresh_interval' => '1s']]);
            $this->index->forcemerge(['max_num_segments' => 5]);
        }
    }

    /**
     * Reindex a specific entity.
     * You HAVE to call self::finishBulk after!
     */
    public function index(string $entityFQN, mixed $identifier): void
    {
        $this->disableIndexingFilters();

        $repository = $this->em->getRepository($entityFQN);
        $object = $repository->findOneBy(['id' => $identifier]);
        $this->indexResolvedObject($entityFQN, $identifier, $object);
    }

    /**
     * Synchronize an already resolved target without reading it again.
     * The caller must resolve it with indexing filters disabled and validate its identity.
     * Call finishBulk() to send the pending operation.
     */
    public function indexResolvedObject(string $entityFQN, mixed $identifier, ?object $object): void
    {
        if ($object instanceof IndexableInterface && $object->isIndexable()) {
            $document = $this->buildDocument($object);
            $this->addToBulk($document);
        } else {
            $this->remove($entityFQN, $identifier);
        }
    }

    public function buildDocumentAndAddToBulk(mixed $object): void
    {
        if ($object instanceof IndexableInterface && $object->isIndexable()) {
            $document = $this->buildDocument($object);
            $this->addToBulk($document);
        }
    }

    /**
     * Remove / Delete from the index.
     * You HAVE to call self::finishBulk after!
     */
    public function remove(string $entityFQN, mixed $identifier): void
    {
        $this->addToBulk(
            new Document(
                sprintf('%s:%s', $this->getTypeFromEntityFQN($entityFQN), $identifier),
                [],
                '_doc'
            )
        );
    }

    /**
     * To call to flush everything still in the pending Bulk.
     * We do two different calls because we ignore 404 for DELETE operations,
     * but zero tolerance for error on UPSERT.
     */
    public function finishBulk(bool $isCli = false): void
    {
        if (\count($this->currentInsertBulk) > 0) {
            $bulk = new Bulk($this->client);
            $bulk->setRequestParam('pipeline', 'geoip');
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

        if (!$isCli) {
            $this->getIndex()->refresh();
        }
        $this->currentInsertBulk = [];
        $this->currentDeleteBulk = [];
    }

    /**
     * All the Doctrine classes implementing IndexableInterface.
     */
    public function getClassesToIndex(): array
    {
        return $this->indexableTypes->getClasses();
    }

    public function setIndex(Index $index): self
    {
        $this->index = $index;

        return $this;
    }

    /**
     * Restore only filters disabled by this scope, including on failure or nested calls.
     *
     * @template T
     *
     * @param callable(): T $operation
     *
     * @return T
     */
    public function withIndexingFiltersDisabled(callable $operation): mixed
    {
        $disabledFilters = $this->disableIndexingFilters();

        try {
            return $operation();
        } finally {
            foreach ($disabledFilters as $filter) {
                $this->em->getFilters()->enable($filter);
            }
        }
    }

    public function addApiAnalyticsDocumentToBulk(array $data): void
    {
        $this->addToBulk(new Document(null, $data, 'api_analytics'));
    }

    protected function buildDocument(IndexableInterface $object): Document
    {
        $json = [];

        try {
            $json = $this->serializer->serialize($object, 'json', [
                'groups' => $object->getElasticsearchSerializationGroups(),
            ]);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . $exception->getMessage());
        }

        return new Document(
            sprintf('%s:%s', $object::getElasticsearchTypeName(), $object->getId()),
            $json,
            '_doc'
        );
    }

    /**
     * Let isIndexable() decide eligibility, including for filtered entities.
     *
     * @return list<string> Previously enabled filters, for callers that restore their state
     */
    private function disableIndexingFilters(): array
    {
        $filters = $this->em->getFilters();
        $disabledFilters = [];
        foreach (['softdeleted', ContributionCompletionStatusFilter::FILTER_NAME] as $name) {
            if ($filters->isEnabled($name)) {
                $filters->disable($name);
                $disabledFilters[] = $name;
            }
        }

        return $disabledFilters;
    }

    private function getTypeFromEntityFQN($entityFQN): string
    {
        $parentClass = (new \ReflectionClass($entityFQN))->getParentClass() ?? false;
        if ($parentClass) {
            if (Comment::class === $parentClass->getName()) {
                return 'comment';
            }

            if (
                AbstractVote::class === $parentClass->getName()
                || AbstractProposalVote::class === $parentClass->getName()
            ) {
                return 'vote';
            }

            if (AbstractResponse::class === $parentClass->getName()) {
                return 'response';
            }

            if (AbstractDistrict::class === $parentClass->getName()) {
                return 'district';
            }
        }

        $classes = $this->getClassesToIndex();

        return array_search($entityFQN, $classes, true);
    }

    private function indexType(string $class, int $offset, ?OutputInterface $output = null): void
    {
        $this->stopwatch->start($this->getTypeFromEntityFQN($class));
        $repository = $this->em->getRepository($class);

        $query = $repository->createQueryBuilder('a')->getQuery();
        // TODO: all iterated queries should be ordered.
        if (Proposal::class === $class) {
            $query = $repository
                ->createQueryBuilder('a')
                ->orderBy('a.id')
                ->getQuery()
            ;
        }

        $iterableResult = $query->iterate();

        if ($output) {
            $count = $repository
                ->createQueryBuilder('a')
                ->select('count(a)')
                ->getQuery()
                ->getSingleScalarResult()
            ;
            $output->writeln(\PHP_EOL . "<info> Indexing {$count} {$class}</info>");
            $progress = new ProgressBar($output, $count);
            $progress->start();
        }
        $correctlyIndexed = 0;
        $correctlyDeleted = 0;
        foreach ($iterableResult as $key => $row) {
            if ($key >= $offset) {
                /** @var IndexableInterface $object */
                $object = $row[0];

                if ($object->isIndexable()) {
                    $document = $this->buildDocument($object);
                    $this->addToBulk($document, false);
                    ++$correctlyIndexed;
                } else {
                    // Empty means DELETE.
                    $this->addToBulk(
                        new Document(
                            sprintf('%s:%s', $object::getElasticsearchTypeName(), $object->getId()),
                            [],
                            '_doc'
                        ),
                        false
                    );
                    ++$correctlyDeleted;
                }
            }

            if (isset($progress)) {
                $progress->advance();
            }

            // Documents already contain serialized data; release their entity graphs,
            // including rows skipped by the offset, before processing the next batch.
            if (0 === ($key + 1) % self::BULK_SIZE) {
                $this->finishBulk(true);
                $this->em->clear();
            }
        }
        $this->em->clear();
        $this->finishBulk(true);

        $event = $this->stopwatch->stop($this->getTypeFromEntityFQN($class));
        if (isset($progress)) {
            $progress->finish();
            $output->writeln([
                '',
                $event->getDuration() > 500
                    ? '- <error>' . $event->getDuration() . '</error> ms'
                    : '- <comment>' . $event->getDuration() . '</comment> ms',
                '- <comment>' . $correctlyIndexed . '</comment> indexations',
                '- <comment>' . $correctlyDeleted . '</comment> deletions',
            ]);
        }
    }

    /**
     * Add a Document to the current bulk.
     * This does not send the bulk! /!\ (only if the threshold is hit).
     */
    private function addToBulk(Document $document, bool $refresh = true): void
    {
        $document->setIndex($this->index);

        if (!empty($document->getData())) {
            $this->currentInsertBulk[] = $document;
        } else {
            $this->currentDeleteBulk[] = $document;
        }

        if (
            \count($this->currentInsertBulk) >= self::BULK_SIZE
            || \count($this->currentDeleteBulk) >= self::BULK_SIZE
        ) {
            $this->finishBulk(!$refresh);
        }
    }
}
