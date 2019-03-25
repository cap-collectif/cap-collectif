<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyResponsesResolver implements ResolverInterface
{
    public function __invoke(Reply $reply): iterable
    {
        return $reply->getResponses();
    }
}
