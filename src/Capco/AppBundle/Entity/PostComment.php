<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class PostComment.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostCommentRepository")
 */
class PostComment extends Comment
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Post", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="post_id", referencedColumnName="id", onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private $Post;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return mixed
     */
    public function getPost()
    {
        return $this->Post;
    }

    /**
     * @param $Post
     *
     * @return $this
     */
    public function setPost($Post)
    {
        $this->Post = $Post;
        $Post->addComment($this);

        return $this;
    }

    // ************************ Overriden methods *********************************

    public function getRelatedObject()
    {
        return $this->getPost();
    }

    /**
     * @param $object
     *
     * @return mixed
     */
    public function setRelatedObject($object)
    {
        return $this->setPost($object);
    }
}
