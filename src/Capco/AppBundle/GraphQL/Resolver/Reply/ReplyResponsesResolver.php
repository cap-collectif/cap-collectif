<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Reply;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;

class ReplyResponsesResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function __invoke(Reply $reply, $viewer, \ArrayObject $context): iterable
    {
        $skipVerification =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');

        $author = $reply->getAuthor();

        if (
            !$skipVerification &&
            $reply->getQuestionnaire()->isPrivateResult() &&
            (!$viewer || (!$viewer->isAdmin() && $viewer->getId() !== $author->getId()))
        ) {
            $this->logger->warn('Tried to access private responses on a reply.');

            return [];
        }

        return $this->filterVisibleResponses($reply->getResponses(), $author, $viewer, $context);
    }
}
