<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Routing\Router;
use Doctrine\ORM\EntityNotFoundException;

class CommentResolver
{
    protected $em;
    protected $router;
    protected $urlResolver;

    public function __construct(EntityManager $em, Router $router, UrlResolver $urlResolver)
    {
        $this->em = $em;
        $this->router = $router;
        $this->urlResolver = $urlResolver;
    }

    public function createCommentForType($objectType)
    {
        $comment = null;
        if ($objectType === 'Idea') {
            $comment = new IdeaComment();
        } elseif ($objectType === 'Event') {
            $comment = new EventComment();
        } elseif ($objectType === 'Post') {
            $comment = new PostComment();
        }

        return $comment;
    }

    public function getObjectByTypeAndId($objectType, $objectId)
    {
        $object = null;
        if ($objectType === 'Idea') {
            $object = $this->em->getRepository('CapcoAppBundle:Idea')->find($objectId);
        } elseif ($objectType === 'Event') {
            $object = $this->em->getRepository('CapcoAppBundle:Event')->find($objectId);
        } elseif ($objectType === 'Post') {
            $object = $this->em->getRepository('CapcoAppBundle:Post')->find($objectId);
        }

        return $object;
    }

    public function getCommentsByObject($object)
    {
        if ($object instanceof Idea) {
            return $this->em->getRepository('CapcoAppBundle:IdeaComment')->getEnabledByIdea($object);
        }

        if ($object instanceof Event) {
            return $this->em->getRepository('CapcoAppBundle:EventComment')->getEnabledByEvent($object);
        }

        if ($object instanceof Post) {
            return $this->em->getRepository('CapcoAppBundle:PostComment')->getEnabledByPost($object);
        }
    }

    public function getRelatedObject(Comment $comment)
    {
        try {
            return $comment->getRelatedObject();
        } catch (EntityNotFoundException $e) {
            return null;
        }
    }

    public function getUrlOfObjectByTypeAndId($objectType, $objectId, $absolute = false)
    {
        $object = $this->getObjectByTypeAndId($objectType, $objectId);

        return $this->urlResolver->getObjectUrl($object, $absolute);
    }

    public function getUrlOfRelatedObject(Comment $comment, $absolute = false)
    {
        $object = $this->getRelatedObject($comment);

        return $this->urlResolver->getObjectUrl($object, $absolute);
    }

    public function getAdminUrlOfRelatedObject(Comment $comment, $absolute = false)
    {
        $object = $this->getRelatedObject($comment);

        return $this->urlResolver->getAdminObjectUrl($object, $absolute);
    }

    public function canShowCommentOn($object)
    {
        return $object->getIsCommentable();
    }

    public function canAddCommentOn($object)
    {
        return $object->canComment();
    }

    public function setObjectOnComment($object, Comment $comment)
    {
        $comment->setRelatedObject($object);

        return $comment;
    }
}
