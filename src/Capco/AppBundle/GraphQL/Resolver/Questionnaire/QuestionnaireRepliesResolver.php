<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionnaireRepliesResolver implements ResolverInterface
{
    private $replyRepository;

    public function __construct(ReplyRepository $replyRepository)
    {
        $this->replyRepository = $replyRepository;
    }

    public function __invoke(
        Questionnaire $questionnaire,
        Arg $args,
        ?User $viewer = null
    ): Connection {
        $includeUnpublished = false;
        $includeDraft = false;

        if (
            $viewer &&
            $args->offsetExists('includeUnpublished') &&
            true === $args->offsetGet('includeUnpublished')
        ) {
            $includeUnpublished = true;
        }

        if (
            $viewer &&
            $args->offsetExists('includeDraft') &&
            true === $args->offsetGet('includeDraft')
        ) {
            $includeDraft = true;
        }

        $totalCount = 0;

        // This is for performance, but maybe no more useful…
        if ($questionnaire->getStep()) {
            $totalCount = $questionnaire->getStep()->getRepliesCount();
        }

        if ($includeUnpublished || $includeDraft) {
            $totalCount = $this->calculateTotalCount(
                $questionnaire,
                $includeUnpublished,
                $includeDraft
            );
        }

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $questionnaire,
            $includeUnpublished,
            $includeDraft
        ) {
            return $this->replyRepository->findByQuestionnaire(
                $questionnaire,
                $offset,
                $limit,
                $includeUnpublished,
                $includeDraft
            );
        });

        return $paginator->auto($args, $totalCount);
    }

    public function calculatePublishedTotalCount(Questionnaire $questionnaire): int
    {
        return $this->replyRepository->countPublishedForQuestionnaire($questionnaire);
    }

    public function calculateTotalCount(
        Questionnaire $questionnaire,
        bool $includeUnpublished,
        bool $includeDraft
    ): int {
        return $this->replyRepository->countForQuestionnaire(
            $questionnaire,
            $includeUnpublished,
            $includeDraft
        );
    }
}
