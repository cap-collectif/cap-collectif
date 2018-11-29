<?php
namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Interfaces\SoftDeleteable;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class CommentResolver
{
    protected $em;
    protected $router;
    protected $urlResolver;

    public function __construct(
        EntityManagerInterface $em,
        Router $router,
        UrlResolver $urlResolver
    ) {
        $this->em = $em;
        $this->router = $router;
        $this->urlResolver = $urlResolver;
    }

    public function createCommentForType($objectType)
    {
        $comment = null;
        if ('Event' === $objectType) {
            $comment = new EventComment();
        } elseif ('Post' === $objectType) {
            $comment = new PostComment();
        }

        return $comment;
    }

    public function getObjectByTypeAndId($objectType, $objectId)
    {
        $object = null;
        if ('Event' === $objectType) {
            $object = $this->em->getRepository('CapcoAppBundle:Event')->find($objectId);
        } elseif ('Post' === $objectType) {
            $object = $this->em->getRepository('CapcoAppBundle:Post')->find($objectId);
        }

        return $object;
    }

    public function getCommentsByObject($object)
    {
        if ($object instanceof Event) {
            return $this->em
                ->getRepository('CapcoAppBundle:EventComment')
                ->getEnabledByEvent($object);
        }

        if ($object instanceof Post) {
            return $this->em
                ->getRepository('CapcoAppBundle:PostComment')
                ->getEnabledByPost($object);
        }
    }

    public function getRelatedObject(Comment $comment)
    {
        try {
            $relatedObject = $comment->getRelatedObject();
            if ($relatedObject && $relatedObject instanceof SoftDeleteable) {
                return !$relatedObject->isDeleted() ? $relatedObject : null;
            }
        } catch (EntityNotFoundException $e) {
            $relatedObject = null;
        }

        return $relatedObject;
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

    public function getAdminUrl(Comment $comment, $absolute = false)
    {
        return $this->router->generate(
            'admin_capco_app_comment_edit',
            ['id' => $comment->getId()],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH
        );
    }

    public function setObjectOnComment($object, Comment $comment)
    {
        $comment->setRelatedObject($object);

        return $comment;
    }
}
