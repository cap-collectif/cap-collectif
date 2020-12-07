<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class QuestionnaireViewerRepliesResolver implements ResolverInterface
{
    use ResolverTrait;

    private ReplyRepository $replyRepo;
    private LoggerInterface $logger;

    public function __construct(ReplyRepository $replyRepo, LoggerInterface $logger)
    {
        $this->replyRepo = $replyRepo;
        $this->logger = $logger;
    }

    public function __invoke(
        Questionnaire $questionnaire,
        $viewer,
        Argument $args
    ): ConnectionInterface {
        $viewer = $this->preventNullableViewer($viewer);
        $totalCount = 0;

        $paginator = new Paginator(function (int $limit, int $offset) use (
            $questionnaire,
            $viewer,
            &$totalCount
        ) {
            try {
                $replies = $this->replyRepo->getForUserAndQuestionnaire(
                    $questionnaire,
                    $viewer,
                    $limit,
                    $offset
                );
                $totalCount = $replies->count();

                return $replies->getValues();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Could not find replies.');
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
