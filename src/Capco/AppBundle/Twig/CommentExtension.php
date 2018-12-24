<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Model\CommentableInterface;

class CommentExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(CommentResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('capco_comment_can_show', [$this, 'canShowCommentOnObject']),
            new \Twig_SimpleFunction('capco_comment_can_add', [$this, 'canAddCommentOnObject']),
            new \Twig_SimpleFunction('capco_comment_object_url', [$this, 'getRelatedObjectUrl']),
            new \Twig_SimpleFunction('capco_comment_object', [$this, 'getRelatedObject']),
            new \Twig_SimpleFunction('capco_comment_object_admin_url', [
                $this,
                'getRelatedObjectAdminUrl',
            ]),
        ];
    }

    public function getRelatedObjectUrl(Comment $comment, $absolute = false)
    {
        return $this->resolver->getUrlOfRelatedObject($comment, $absolute);
    }

    public function getRelatedObjectAdminUrl(Comment $comment, $absolute = false)
    {
        return $this->resolver->getAdminUrlOfRelatedObject($comment, $absolute);
    }

    public function getRelatedObject(Comment $comment)
    {
        return $this->resolver->getRelatedObject($comment);
    }

    public function canShowCommentOnObject(CommentableInterface $object): bool
    {
        return $object->isCommentable();
    }

    public function canAddCommentOnObject(CommentableInterface $object): bool
    {
        return $object->acceptNewComments();
    }
}
