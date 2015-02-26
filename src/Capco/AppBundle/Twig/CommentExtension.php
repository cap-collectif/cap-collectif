<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Manager\CommentResolver;
use Symfony\Component\Routing\Router;

class CommentExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(CommentResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_comment';
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('capco_comment_allowed', array($this, 'canCommentOnObject')),
            new \Twig_SimpleFunction('capco_comment_object_url', array($this, 'getRelatedObjectUrl')),
            new \Twig_SimpleFunction('capco_comment_object', array($this, 'getRelatedObject')),
        );
    }

    public function getRelatedObjectUrl(Comment $comment, $absolute = false)
    {
        return $this->resolver->getUrlOfRelatedObject($comment, $absolute);
    }

    public function getRelatedObject(Comment $comment)
    {
        return $this->resolver->getRelatedObject($comment);
    }

    public function canCommentOnObject($object)
    {
        return $this->resolver->canCommentOn($object);
    }
}
