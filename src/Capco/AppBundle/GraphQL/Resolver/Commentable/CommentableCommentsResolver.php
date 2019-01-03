<?php

namespace Capco\AppBundle\GraphQL\Resolver\Commentable;

use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\Model\CommentableInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class CommentableCommentsResolver implements ResolverInterface
{
    private $commentableCommentsDataLoader;

    public function __construct(CommentableCommentsDataLoader $commentableCommentsDataLoader)
    {
        $this->commentableCommentsDataLoader = $commentableCommentsDataLoader;
    }

    public function __invoke(CommentableInterface $commentable, Argument $args, $viewer)
    {
        return $this->commentableCommentsDataLoader->load(compact('commentable', 'args', 'viewer'));
    }
}
