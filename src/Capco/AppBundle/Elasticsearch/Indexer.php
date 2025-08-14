<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
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

    /**
     * @var array
     */
    private $classes;

    public function __construct(
        ManagerRegistry $registry,
        private readonly SerializerInterface $serializer,
        Index $index,
        private readonly LoggerInterface $logger,
        private readonly Stopwatch $stopwatch
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
        $this->disableBuiltinSoftdelete();
        $this->disableContributionCompletionStatusFilter();
        if ($isCli) {
            $this->getIndex()->setSettings(['index' => ['refresh_interval' => '-1']]);
        }

        $classes = $this->getClassesToIndex();

        $classesOrdered = array_values($classes);
        usort($classesOrdered, fn ($a, $b) => \call_user_func($a . '::getElasticsearchPriority') >
            \call_user_func($b . '::getElasticsearchPriority'));

        foreach ($classesOrdered as $class) {
            $this->indexType($class, 0, $output);
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
        $this->disableBuiltinSoftdelete();
        $this->disableContributionCompletionStatusFilter();
        if ($isCli) {
            $this->getIndex()->setSettings(['index' => ['refresh_interval' => '-1']]);
        }

        $classes = $this->getClassesToIndex();
        $this->indexType($classes[$type], $offset, $output);
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
        $this->disableBuiltinSoftdelete();
        $this->disableContributionCompletionStatusFilter();

        $repository = $this->em->getRepository($entityFQN);
        $object = $repository->findOneBy(['id' => $identifier]);
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
        $this->classes['reply'] = Reply::class;
        $this->classes['vote'] = AbstractVote::class;
        $this->classes['response'] = AbstractResponse::class;
        $this->classes['district'] = AbstractDistrict::class;

        return $this->classes;
    }

    public function setIndex(Index $index): self
    {
        $this->index = $index;

        return $this;
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
     * @todo remove this when we no more use doctrine built-in sofdelete
     */
    private function disableBuiltinSoftdelete(): void
    {
        $filters = $this->em->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
    }

    private function disableContributionCompletionStatusFilter(): void
    {
        $filters = $this->em->getFilters();
        if ($filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }
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

                ++$correctlyIndexed;
            } else {
                // Empty mean DELETE
                $this->addToBulk(
                    new Document(
                        sprintf('%s:%s', $object::getElasticsearchTypeName(), $object->getId()),
                        [],
                        '_doc'
                    )
                );
                ++$correctlyDeleted;
            }

            if (isset($progress)) {
                $progress->advance();
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
    private function addToBulk(Document $document): void
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
            $this->finishBulk();
        }
    }
}
