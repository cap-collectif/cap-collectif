<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ResponsesOrderField;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Search\ResponseSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class QuestionResponsesResolver implements QueryInterface
{
    public function __construct(
        private readonly ResponseSearch $responseSearch,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(AbstractQuestion $question, Arg $args, $viewer)
    {
        $emptyConnection = ConnectionBuilder::empty();

        if (
            $question->getQuestionnaire()
            && $question->getQuestionnaire()->isPrivateResult()
            && (!$viewer || !$viewer->isAdmin())
            && $question->getQuestionnaire()->getOwner() !== $viewer
        ) {
            return $emptyConnection;
        }

        if ($question->getQuestionnaire() && !$question->getQuestionnaire()->canDisplay($viewer)) {
            return $emptyConnection;
        }

        $arguments = $args->getArrayCopy();
        $withNotConfirmedUser =
            isset($arguments['withNotConfirmedUser'])
            && true === $arguments['withNotConfirmedUser'];
        $term = $arguments['term'] ?? null;
        $sentimentFilter = $args->offsetGet('iaSentiment');
        $category = $arguments['iaCategory'] ?? null;
        $starCrafter = $arguments['hasViewerStarred'] ? $viewer : null;
        $orderBy = self::getOrderBy($arguments);

        // Schema design is wrong but let's return empty connection for now…
        if ($question instanceof SectionQuestion) {
            return $emptyConnection;
        }

        // get data of $question instanceof MultipleChoiceQuestion && $question instanceof SimpleQuestion && $question instanceof MediaQuestion
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $question,
            $withNotConfirmedUser,
            $term,
            $sentimentFilter,
            $category,
            $starCrafter,
            $orderBy
        ) {
            try {
                return $this->responseSearch->getResponsesByQuestion(
                    $question,
                    $withNotConfirmedUser,
                    $term,
                    $sentimentFilter,
                    $category,
                    $starCrafter,
                    $orderBy,
                    $limit,
                    $cursor
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find responses of survey failed');
            }
        });

        return $paginator->auto($args);
    }

    private static function getOrderBy(array $arguments): array
    {
        $orderByField =
            ResponsesOrderField::SORT_FIELD[
                $arguments['orderBy']['field'] ?? ResponsesOrderField::CREATED_AT
            ];
        $orderByDirection =
            OrderDirection::SORT_DIRECTION[
                $arguments['orderBy']['direction'] ?? OrderDirection::DESC
            ];

        return [$orderByField => ['order' => $orderByDirection]];
    }
}
