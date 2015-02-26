<?php

namespace Capco\AppBundle\Manager;


use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Repository\CommentRepository;
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

    public function getObjectByTypeAndId($objectType, $objectId)
    {
        $object = null;
        if ($objectType == 'Capco\AppBundle\Entity\Idea'){
            $object = $this->em->getRepository('CapcoAppBundle:Idea')->findOneById($objectId);
        }
        return $object;
    }

    public function getCommentsByObject($object)
    {
        if ($object instanceof Idea) {
            return $this->em->getRepository('CapcoAppBundle:Comment')->getEnabledByIdea($object);
        } else {
            return null;
        }

    }

    public function getRelatedObject(Comment $comment)
    {
        if (null != $comment->getIdea()) {
            return $comment->getIdea();
        } else {
            return null;
        }

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
        else {
            return $this->router->generate('app_homepage', array(), $absolute);
        }
    }

    public function getUrlOfRelatedObject(Comment $comment, $absolute = false)
    {
        $object = $this->getRelatedObject($comment);
        return $this->getUrlOfObject($object, $absolute);

    }

    public function canCommentOn($object)
    {
        if ($object instanceof Idea) {
            return $object->canContribute();
        } else {
            return false;
        }
    }

    public function setObjectOnComment($object, Comment $comment)
    {
        if ($object instanceof Idea) {
            $comment->setIdea($object);
        }

    }
}
