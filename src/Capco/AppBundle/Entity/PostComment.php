<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostCommentRepository")
 */
class PostComment extends Comment
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Post", inversedBy="comments")
     * @ORM\JoinColumn(name="post_id", referencedColumnName="id", onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private $post;

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(Post $post): self
    {
        $this->post = $post;
        $post->addComment($this);

        return $this;
    }

    public function isCommentable(): bool
    {
        return true;
    }

    public function acceptNewComments(): bool
    {
        return $this->isPublished() && !$this->isTrashed();
    }

    public function getRelatedObject(): ?Post
    {
        return $this->getPost();
    }

    public function getKind(): string
    {
        return 'newsComment';
    }

    public function setRelatedObject($object)
    {
        return $this->setPost($object);
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['ElasticsearchComment', 'ElasticsearchNestedAuthor'];
    }
}
