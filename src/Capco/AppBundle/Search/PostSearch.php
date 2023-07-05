<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\PostAffiliation;
use Capco\AppBundle\Enum\PostOrderField;
use Capco\AppBundle\Repository\PostRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\QueryString;
use Elastica\Query\Term;

class PostSearch extends Search
{
    private PostRepository $postRepository;

    public function __construct(Index $index, PostRepository $replyRepository)
    {
        parent::__construct($index);
        $this->type = 'post';
        $this->postRepository = $replyRepository;
    }

    public function getUserPostsPaginated(
        Author $author,
        int $limit,
        array $affiliations = [],
        ?string $cursor = null,
        ?string $searchQuery = null,
        string $orderByField = PostOrderField::UPDATED_AT,
        string $orderByDirection = OrderDirection::DESC
    ): ElasticsearchPaginatedResult {
        $boolQuery = new BoolQuery();

        if ($searchQuery) {
            $queryString = new QueryString();
            $queryString->setQuery($searchQuery);
            $queryString->setFields(['title', 'body', 'abstract']);
            $boolQuery->addMust($queryString);
        }

        if ($affiliations && \in_array(PostAffiliation::OWNER, $affiliations, true)) {
            $boolQuery->addFilter(new Term(['owner.id' => $author->getId()]));
        }

        $query = new Query($boolQuery);

        if ($orderByField && $orderByDirection) {
            $query->addSort($this->getUserSort($orderByField, $orderByDirection));
        }

        $this->addObjectTypeFilter($query, $this->type);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);

        $cursors = $this->getCursors($resultSet);
        $posts = $this->getHydratedResultsFromResultSet($this->postRepository, $resultSet);

        return new ElasticsearchPaginatedResult($posts, $cursors, $resultSet->getTotalHits());
    }

    private function getUserSort($field, $direction): array
    {
        switch ($field) {
            case PostOrderField::UPDATED_AT:
                $sortField = PostOrderField::SORT_FIELD[PostOrderField::UPDATED_AT];

                break;

            case PostOrderField::CREATED_AT:
                $sortField = PostOrderField::SORT_FIELD[PostOrderField::CREATED_AT];

                break;

            default:
                throw new \RuntimeException("Unknown order: ${$field}");
        }

        return [$sortField => ['order' => $direction], 'id' => new \stdClass()];
    }
}
