<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Interfaces\ReplyInterface;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyUrlResolver implements ResolverInterface
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(ReplyInterface $reply): string
    {
        if ($reply->getQuestionnaire() && null !== $reply->getQuestionnaire()->getStep()) {
            return $this->urlResolver->getStepUrl($reply->getQuestionnaire()->getStep(), true);
        }

        return '';
    }
}
