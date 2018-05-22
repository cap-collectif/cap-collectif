<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyViewerCanDeleteResolver implements ResolverInterface
{
    public function __invoke(Reply $reply, User $user): bool
    {
        return $reply->getAuthor() === $user && $reply->getQuestionnaire()->canContribute();
    }
}
