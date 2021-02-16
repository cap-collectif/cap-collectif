<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\ResultSet;

class DebateSearch extends Search
{
    private DebateArgumentRepository $debateArgumentRepository;

    public function __construct(Index $index, DebateArgumentRepository $debateArgumentRepository)
    {
        parent::__construct($index);
        $this->debateArgumentRepository = $debateArgumentRepository;
    }

    public function searchDebateArguments(
        Debate $debate,
        int $limit,
        ?array $orderBy,
        ?array $filters,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = self::createDebateArgumentsFilteredQuery($debate, $filters);

        $query = new Query($boolQuery);
        $query = $this->sortQuery($query, $orderBy);
        if ($limit) {
            $query->setSize($limit + 1);
        }
        $this->applyCursor($query, $cursor);

        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    private function sortQuery(Query $query, ?array $orderBy): Query
    {
        if ($orderBy) {
            switch ($orderBy['field']) {
                case 'votesCount':
                    $field = 'votesCount';

                    break;
                case 'CREATED_AT':
                    $field = 'createdAt';

                    break;
                case 'PUBLISHED_AT':
                default:
                    $field = 'publishedAt';
            }
            $this->setSortWithId($query, [
                $field => ['order' => $orderBy['direction']],
            ]);
        }

        return $query;
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->debateArgumentRepository, $response),
            $cursors,
            $response->getTotalHits()
        );
    }

    private static function createDebateArgumentsFilteredQuery(
        Debate $debate,
        ?array $filters
    ): BoolQuery {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(new Term(['objectType' => 'debateArgument']));
        $boolQuery->addFilter(new Term(['debate.id' => $debate->getId()]));
        if ($filters) {
            if (isset($filters['isPublished'])) {
                $boolQuery->addFilter(new Term(['published' => $filters['isPublished']]));
            }
            if (isset($filters['isTrashed'])) {
                $boolQuery->addFilter(new Term(['trashed' => $filters['isTrashed']]));
            }
            if (isset($filters['value'])) {
                $boolQuery->addFilter(new Term(['voteType' => $filters['value']]));
            }
        }

        return $boolQuery;
    }
}
