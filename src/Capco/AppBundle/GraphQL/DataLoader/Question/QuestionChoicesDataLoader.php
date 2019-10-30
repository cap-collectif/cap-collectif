<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Question;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

class QuestionChoicesDataLoader extends BatchDataLoader
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
        QuestionChoiceRepository $repository
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
        $questions = array_map(static function (array $key) {
            return $key['question'];
        }, $keys);

        $choices = $this->repository->findBy([
            'question' => array_map(static function (AbstractQuestion $question) {
                return $question->getId();
            }, $questions)
        ]);

        $args = array_map(static function (array $key) {
            return $key['args'];
        }, $keys);

        $results = array_map(
            static function (AbstractQuestion $question, int $i) use ($args, $choices) {
                if (!$question instanceof MultipleChoiceQuestion) {
                    return [];
                }
                $questionChoices = array_filter($choices, static function (
                    QuestionChoice $choice
                ) use ($question) {
                    return $choice->getQuestion()->getId() === $question->getId();
                });
                if (
                    true === $args[$i]->offsetGet('allowRandomize') &&
                    $question->isRandomQuestionChoices()
                ) {
                    shuffle($questionChoices);

                    return new ArrayCollection($choices);
                }

                return $questionChoices;
            },
            $questions,
            array_keys($questions)
        );

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
