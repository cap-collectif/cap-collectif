<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\AbstractComment as Comment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Idea;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Routing\Router;

class CommentResolver
{
    protected $em;
    protected $router;

    public function __construct(EntityManager $em, Router $router)
    {
        $this->em = $em;
        $this->router = $router;
    }

    public function createCommentForType($objectType)
    {
        $comment = null;
        if ($objectType == 'Idea') {
            $comment = new IdeaComment();
        } elseif ($objectType == 'Event') {
            $comment = new EventComment();
        } elseif ($objectType == 'Post') {
            $comment = new PostComment();
        }

        return $comment;
    }

    public function getObjectByTypeAndId($objectType, $objectId)
    {
        $object = null;
        if ($objectType == 'Idea') {
            $object = $this->em->getRepository('CapcoAppBundle:Idea')->find($objectId);
        } elseif ($objectType == 'Event') {
            $object = $this->em->getRepository('CapcoAppBundle:Event')->find($objectId);
        } elseif ($objectType == 'Post') {
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

        return;
    }

    public function getRelatedObject(Comment $comment)
    {
        return $comment->getRelatedObject();
    }

    public function getUrlOfObjectByTypeAndId($objectType, $objectId, $absolute = false)
    {
        $object = $this->getObjectByTypeAndId($objectType, $objectId);

        return $this->getUrlOfObject($object, $absolute);
    }

    public function getUrlOfObject($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('app_idea_show', array('slug' => $object->getSlug()), $absolute);
        }

        if ($object instanceof Event) {
            return $this->router->generate('app_event_show', array('slug' => $object->getSlug()), $absolute);
        }

        if ($object instanceof Post) {
            return $this->router->generate('app_blog_show', array('slug' => $object->getSlug()), $absolute);
        }

        return $this->router->generate('app_homepage', array(), $absolute);
    }

    public function getAdminUrlOfObject($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('admin_capco_app_idea_show', array('id' => $object->getId()), $absolute);
        }

        if ($object instanceof Event) {
            return $this->router->generate('admin_capco_app_event_show', array('id' => $object->getId()), $absolute);
        }

        if ($object instanceof Post) {
            return $this->router->generate('admin_capco_app_post_show', array('id' => $object->getId()), $absolute);
        }

        return '';
    }

    public function getUrlOfRelatedObject(Comment $comment, $absolute = false)
    {
        $object = $this->getRelatedObject($comment);

        return $this->getUrlOfObject($object, $absolute);
    }

    public function getAdminUrlOfRelatedObject(Comment $comment, $absolute = false)
    {
        $object = $this->getRelatedObject($comment);

        return $this->getAdminUrlOfObject($object, $absolute);
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

    public function getBestBreakIndexForComment(Comment $comment, $limit = 500, $margin = 75)
    {
        $length = strlen($comment->getBody());
        if ($length <= $limit) {
            return $limit;
        }
        $offset = $length - $limit;
        $bestIndex = null;

        // We find the \n, \r or \r\n that is closer to the limit
        $bestNL = strrpos($comment->getBody(), "\n", -$offset);
        $bestCR = strrpos($comment->getBody(), "\r", -$offset);
        $bestCRNL = strrpos($comment->getBody(), "\r\n", -$offset);

        // If at least one of the three characters appears, we want to break here,
        if ($bestNL || $bestCR || $bestCRNL) {
            $bestIndex = max($bestNL, $bestCR, $bestCRNL);
            $bestIndex = $limit - $bestIndex > $margin ? null : $bestIndex;
        }

        // else we break at closer space
        if (!$bestIndex) {
            $bestIndex = strrpos($comment->getBody(), " ", -$offset);
        }

        // If there is no best index is found or it's too far away from limit we break at limit
        if (!$bestIndex || $limit - $bestIndex > $margin) {
            return $limit;
        }
        return $bestIndex;
    }
}
