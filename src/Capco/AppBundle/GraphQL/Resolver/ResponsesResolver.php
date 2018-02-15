<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Reply;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ResponsesResolver implements ResolverInterface
{
    public function __invoke(Reply $reply)
    {
        return $reply->getResponses();
    }
}
