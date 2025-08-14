<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ReplyResponsesResolver implements QueryInterface
{
    use ResponsesResolverTrait;

    public function __construct(
        private LoggerInterface $logger,
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository
    ) {
        $this->abstractQuestionRepository = $abstractQuestionRepository;
        $this->abstractResponseRepository = $abstractResponseRepository;
    }

    public function __invoke(Reply $reply, $viewer, \ArrayObject $context): iterable
    {
        $skipVerification =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');

        $responses = [];

        if (false === $reply->isAnonymous()) {
            $author = $reply->getAuthor();

            if (
                !$skipVerification
                && $reply->getQuestionnaire()->isPrivateResult()
                && (!$viewer || (!$viewer->isAdmin() && $viewer->getId() !== $author->getId()))
            ) {
                $this->logger->warning('Tried to access private responses on a reply.');

                return [];
            }
            $responses = $this->filterVisibleResponses(
                $this->getResponsesForReply($reply),
                $author,
                $viewer,
                $context
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
