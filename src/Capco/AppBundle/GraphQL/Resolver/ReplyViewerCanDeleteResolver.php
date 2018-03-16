<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;

class ReplyViewerCanDeleteResolver
{
    public function __invoke(Reply $reply, User $user): bool
    {
        return $reply->getAuthor() === $user && $reply->getQuestionnaire()->canContribute();
    }
}
