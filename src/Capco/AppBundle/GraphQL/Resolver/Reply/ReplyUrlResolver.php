<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Resolver\UrlResolver;

class ReplyUrlResolver
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(Reply $reply): ?string
    {
        if ($reply->getQuestionnaire() && null !== $reply->getQuestionnaire()->getStep()) {
            return $this->urlResolver->getStepUrl($reply->getQuestionnaire()->getStep(), true);
        }

        return null;
    }
}
