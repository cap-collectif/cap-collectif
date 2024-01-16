<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Search\ResponseSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionTagCloudResolver implements QueryInterface
{
    public const CACHE_KEY = 'questionTagCloudData';
    private ResponseSearch $responseSearch;
    private RedisCache $cache;

    public function __construct(ResponseSearch $responseSearch, RedisCache $cache)
    {
        $this->responseSearch = $responseSearch;
        $this->cache = $cache;
    }

    public function __invoke(AbstractQuestion $question, Argument $args): array
    {
        $size = $args->offsetGet('size');
        $cachedQuestionTagCloudData = $this->cache->getItem(
            self::CACHE_KEY . '-' . $question->getId() . '-' . $size
        );
        if (!$cachedQuestionTagCloudData->isHit()) {
            $tagCloud = [];
            $resultSet = $this->responseSearch->getTagCloud($question, $size);
            $tagCloudData = $resultSet->getAggregation('tagCloud')['buckets'];
            foreach ($tagCloudData as $tagCloudDatum) {
                $tagCloud[] = [
                    'value' => $tagCloudDatum['key'],
                    'occurrencesCount' => $tagCloudDatum['doc_count'],
                ];
            }
            $cachedQuestionTagCloudData->set($tagCloud)->expiresAfter(RedisCache::ONE_HOUR);
            $this->cache->save($cachedQuestionTagCloudData);

            return $tagCloud;
        }

        return $cachedQuestionTagCloudData->get();
    }
}
