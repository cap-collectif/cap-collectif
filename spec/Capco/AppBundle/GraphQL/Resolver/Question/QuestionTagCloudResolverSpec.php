<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Question\QuestionTagCloudResolver;
use Capco\AppBundle\Search\ResponseSearch;
use DG\BypassFinals;
use Elastica\ResultSet;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Cache\CacheItem;

BypassFinals::enable();

class QuestionTagCloudResolverSpec extends ObjectBehavior
{
    public function let(ResponseSearch $responseSearch, RedisCache $cache): void
    {
        $this->beConstructedWith($responseSearch, $cache);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(QuestionTagCloudResolver::class);
    }

    public function it_should_return_tag_cloud_without_cache(
        RedisCache $cache,
        ResponseSearch $responseSearch,
        SimpleQuestion $question,
        CacheItem $cacheItem,
        Argument $args,
        ResultSet $resultSet
    ): void {
        $results = [
            [
                'value' => 'bonsoir',
                'occurrencesCount' => 5,
            ],
            [
                'value' => 'bonjour',
                'occurrencesCount' => 4,
            ],
        ];
        $question->getId()->willReturn('question1');
        $args->offsetGet('size')->willReturn(2);
        $cache
            ->getItem('questionTagCloudData-question1-2')
            ->willReturn($cacheItem)
            ->shouldBeCalled()
        ;
        $cacheItem->isHit()->willReturn(false);
        $resultSet->getAggregation('tagCloud')->willReturn([
            'doc_count_error_upper_bound' => 0,
            'sum_other_doc_count' => 137,
            'buckets' => [
                [
                    'key' => 'bonsoir',
                    'doc_count' => 5,
                ],
                [
                    'key' => 'bonjour',
                    'doc_count' => 4,
                ],
            ],
        ]);
        $responseSearch->getTagCloud($question, 2)->willReturn($resultSet);
        $cacheItem
            ->expiresAfter(RedisCache::ONE_HOUR)
            ->shouldBeCalled()
            ->willReturn($cacheItem)
        ;
        $cacheItem
            ->set($results)
            ->shouldBeCalled()
            ->willReturn($cacheItem)
        ;
        $cache
            ->save($cacheItem)
            ->willReturn(true)
            ->shouldBeCalled()
        ;
        $this->__invoke($question, $args)->shouldReturn($results);
    }

    public function it_should_return_tag_cloud_with_cache(
        RedisCache $cache,
        ResponseSearch $responseSearch,
        SimpleQuestion $question,
        CacheItem $cacheItem,
        Argument $args,
        ResultSet $resultSet
    ): void {
        $results = [
            [
                'value' => 'bonsoir',
                'occurrencesCount' => 5,
            ],
            [
                'value' => 'bonjour',
                'occurrencesCount' => 4,
            ],
        ];
        $cacheItem->set($results);
        $question->getId()->willReturn('question2');
        $args->offsetGet('size')->willReturn(2);
        $cache
            ->getItem('questionTagCloudData-question2-2')
            ->willReturn($cacheItem)
            ->shouldBeCalled()
        ;
        $cacheItem->isHit()->willReturn(true);
        $cacheItem->get()->willReturn($results);
        $this->__invoke($question, $args)->shouldReturn($results);
    }
}
