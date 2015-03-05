<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class PostComment
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostCommentRepository")
 * @package Capco\AppBundle\Entity
 */
class PostComment extends AbstractComment
{

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Post", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="post_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $Post = null;

    function __construct()
    {
        parent::__construct();
        $this->Post = null;
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
     * @return $this
     */
    public function setPost($Post)
    {
        $this->Post = $Post;
        $Post->addComment($this);
        return $this;
    }

    // ************************ Overriden methods *********************************

    /**
     * @return null
     */
    public function getRelatedObject()
    {
        return $this->getPost();
    }

    /**
     * @param $object
     * @return mixed
     */
    public function setRelatedObject($object)
    {
        return $this->setPost($object);
    }

}
