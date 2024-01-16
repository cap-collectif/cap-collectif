<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ReplyUrlResolver implements QueryInterface
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(AbstractReply $reply): string
    {
        if ($reply->getQuestionnaire() && null !== $reply->getQuestionnaire()->getStep()) {
            return $this->urlResolver->getStepUrl($reply->getQuestionnaire()->getStep(), true);
        }

        return '';
    }
}
