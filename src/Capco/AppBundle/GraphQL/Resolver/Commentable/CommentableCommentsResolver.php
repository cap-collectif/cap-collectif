<?php

namespace Capco\AppBundle\GraphQL\Resolver\Commentable;

use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\Model\CommentableInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CommentableCommentsResolver implements QueryInterface
{
    public function __construct(private readonly CommentableCommentsDataLoader $commentableCommentsDataLoader)
    {
    }

    public function __invoke(CommentableInterface $commentable, Argument $args, $viewer)
    {
        return $this->commentableCommentsDataLoader->load(compact('commentable', 'args', 'viewer'));
    }
}
