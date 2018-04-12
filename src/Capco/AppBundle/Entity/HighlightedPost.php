<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedPost.
 *
 * @ORM\Entity()
 */
class HighlightedPost extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Post")
     * @ORM\JoinColumn(name="post_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $post;

    /**
     * Gets the value of post.
     *
     * @return mixed
     */
    public function getPost()
    {
        return $this->post;
    }

    /**
     * Sets the value of post.
     *
     * @param mixed $post the post
     *
     * @return self
     */
    public function setPost(Post $post)
    {
        $this->post = $post;

        return $this;
    }

    public function getAssociatedFeatures()
    {
        return ['blog'];
    }

    public function getContent()
    {
        return $this->post;
    }

    public function getType()
    {
        return 'blog';
    }

    public function getMedia()
    {
        return $this->post->getMedia();
    }

//    public function getStartAt()
//    {
//        return $this->post->getStartAt();
//    }
//
//    public function getEndAt()
//    {
//        return $this->post->getEndAt();
//    }
}
