<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\ResponseSearch;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class QuestionResponsesResolver implements ResolverInterface
{
    private $logger;
    private ResponseSearch $responseSearch;

    public function __construct(ResponseSearch $responseSearch, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->responseSearch = $responseSearch;
    }

    public function __invoke(AbstractQuestion $question, Arg $args, $viewer)
    {
        $emptyConnection = ConnectionBuilder::empty();

        if (
            $question->getQuestionnaire() &&
            $question->getQuestionnaire()->isPrivateResult() &&
            (!$viewer || !$viewer->isAdmin()) &&
            $question->getQuestionnaire()->getOwner() !== $viewer
        ) {
            return $emptyConnection;
        }

        if ($question->getQuestionnaire() && !$question->getQuestionnaire()->canDisplay($viewer)) {
            return $emptyConnection;
        }

        $arguments = $args->getArrayCopy();
        $withNotConfirmedUser =
            isset($arguments['withNotConfirmedUser']) &&
            true === $arguments['withNotConfirmedUser'];
        $term = $arguments['term'] ?? null;

        // Schema design is wrong but let's return empty connection for now…
        if ($question instanceof SectionQuestion) {
            return $emptyConnection;
        }

        // get data of $question instanceof MultipleChoiceQuestion && $question instanceof SimpleQuestion && $question instanceof MediaQuestion
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $question,
            $withNotConfirmedUser,
            $term
        ) {
            try {
                return $this->responseSearch->getResponsesByQuestion(
                    $question,
                    $withNotConfirmedUser,
                    $term,
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
}
