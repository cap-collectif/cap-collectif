<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Question;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Enum\JumpsOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\LogicJumpRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

class QuestionJumpsDataLoader extends BatchDataLoader
{
    private $repository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache,
        LogicJumpRepository $repository
    ) {
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $enableCache
        );
        $this->repository = $repository;
    }

    public function all(array $keys)
    {
        $ids = array_map(static function (array $key) {
            return $key['question']->getId();
        }, $keys);

        $jumps = $this->repository->findBy(['origin' => $ids]);
        $orderBy = $keys[0]['args']->offsetGet('orderBy');
        list($field, $direction) = [$orderBy['field'], $orderBy['direction']];

        $results = array_map(static function (int $id) use ($field, $direction, $jumps) {
            $filtered = array_filter($jumps, static function (LogicJump $jump) use ($id) {
                return $jump->getOrigin()->getId() === $id;
            });
            uasort($filtered, static function (LogicJump $a, LogicJump $b) use (
                $direction,
                $field
            ) {
                if (JumpsOrderField::POSITION === $field) {
                    return OrderDirection::ASC === $direction
                        ? $a->getPosition() <=> $b->getPosition()
                        : $b->getPosition() <=> $a->getPosition();
                }

                throw new \InvalidArgumentException(
                    sprintf('Unknown sort field "%s" for Logic Jump.', $field)
                );
            });

            return new ArrayCollection($filtered);
        }, $ids);

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function serializeKey($key): array
    {
        return [
            'questionId' => $key['question']->getId(),
            'args' => $key['args']->getArrayCopy()
        ];
    }
}
