<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Traits\AuthorableTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * @ORM\Table(name="blog_post_authors")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PostAuthorRepository")
 * @CapcoAssert\HasAuthor()
 * @UniqueEntity(
 *     fields={"author", "post"},
 *     errorPath="author",
 *     message="This author is already in use on that post."
 * )
 * @UniqueEntity(
 *     fields={"organization", "post"},
 *     errorPath="organization",
 *     message="This organization is already in use on that post."
 * )
 */
class PostAuthor implements Authorable
{
    use AuthorableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?User $author = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Post", inversedBy="authors", cascade="persist")
     * @ORM\JoinColumn(name="post_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private Post $post;

    public function setPost(Post $post): self
    {
        $this->post = $post;
        $post->addAuthor($this);

        return $this;
    }

    public function getPost(): Post
    {
        return $this->post;
    }

    public function getUsername(): ?string
    {
        return $this->getAuthor() ?? $this->getAuthor()->getUsername();
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }

    public static function create(Post $post, Author $author): PostAuthor
    {
        return (new self())->setPost($post)->setAuthor($author);
    }
}
