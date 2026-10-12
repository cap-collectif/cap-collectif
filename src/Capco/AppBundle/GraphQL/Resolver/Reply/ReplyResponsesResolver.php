<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use FOS\UserBundle\Util\TokenGenerator;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ReplyResponsesResolver implements QueryInterface
{
    use ResponsesResolverTrait;

    public function __construct(
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository,
        TokenGenerator $tokenGenerator,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
        $this->abstractQuestionRepository = $abstractQuestionRepository;
        $this->abstractResponseRepository = $abstractResponseRepository;
        $this->tokenGenerator = $tokenGenerator;
    }

    public function __invoke(Reply $reply, $viewer, \ArrayObject $context, ResolveInfo $info): iterable
    {
        if (!$this->resultsAccess->canViewReply($reply, $viewer, $context, null, $info)) {
            return [];
        }

        $responses = [];

        if (false === $reply->isAnonymous()) {
            $responses = $this->filterVisibleResponses(
                $this->getResponsesForReply($reply),
                $reply->getAuthor(),
                $viewer,
                $context,
                canViewPrivateResponses: $this->resultsAccess->canViewResults($reply->getQuestionnaire(), $context)
            );
        } elseif ($reply->isAnonymous()) {
            $responses = $this->getResponsesForReply($reply);
        }

        $iterator = $responses->getIterator();
        $responsesArray = iterator_to_array($iterator);

        usort($responsesArray, fn ($a, $b) => $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition());

        return $responsesArray;
    }
}
