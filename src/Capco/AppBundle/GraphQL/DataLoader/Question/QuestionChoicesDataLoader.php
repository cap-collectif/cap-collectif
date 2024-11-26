<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Question;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Search\QuestionChoiceSearch;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class QuestionChoicesDataLoader extends BatchDataLoader
{
    private $questionChoiceSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache,
        QuestionChoiceSearch $questionChoiceSearch
    ) {
        parent::__construct(
            $this->all(...),
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $stopwatch,
            $enableCache
        );
        $this->questionChoiceSearch = $questionChoiceSearch;
    }

    public function all(array $keys)
    {
        $questionsDatas = array_map(static function (array $key) {
            return [
                'id' => $key['question']->getId(),
                'isRandomQuestionChoices' => $key['question']->isRandomQuestionChoices(),
                'args' => $key['args'],
                'seed' => $key['seed'],
            ];
        }, $keys);

        $paginatedResults = $this->questionChoiceSearch->searchQuestionChoices($questionsDatas);

        $results = [];
        if (!empty($paginatedResults)) {
            foreach ($keys as $i => $key) {
                $paginator = new ElasticsearchPaginator(static function (
                    ?string $cursor,
                    int $limit
                ) use ($paginatedResults, $i) {
                    return $paginatedResults[$i];
                });
                $results[] = $paginator->auto($key['args']);
            }
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function serializeKey($key): array
    {
        return [
            'id' => $key['question']->getId(),
            'isRandomQuestionChoices' => $key['question']->isRandomQuestionChoices(),
            'args' => $key['args']->getArrayCopy(),
            'seed' => $key['seed'],
        ];
    }
}
