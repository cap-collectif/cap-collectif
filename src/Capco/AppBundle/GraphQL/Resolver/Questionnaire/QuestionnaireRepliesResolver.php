<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionnaireRepliesResolver implements ResolverInterface
{
    private $replyRepository;

    public function __construct(ReplyRepository $replyRepository)
    {
        $this->replyRepository = $replyRepository;
    }

    public function __invoke(Questionnaire $questionnaire, Arg $args): Connection
    {
        $totalCount = $this->replyRepository->countPublishedForQuestionnaire($questionnaire);

        $paginator = new Paginator(function (int $offset, int $limit) use ($questionnaire) {
            return $this->replyRepository
                ->findByQuestionnaire($questionnaire, $offset, $limit)
                ->getIterator()
                ->getArrayCopy();
        });

        return $paginator->auto($args, $totalCount);
    }
}
