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

    public function __toString()
    {
        return $this->getPost() ? $this->getPost()->getTitle() : 'New Highlighted Post';
    }

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
}
