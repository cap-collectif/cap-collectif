<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyViewerCanUpdateResolver implements ResolverInterface
{
    public function __invoke(Reply $reply, User $user): bool
    {
        return $reply->getAuthor() === $user && $reply->getQuestionnaire()->canContribute();
    }
}
