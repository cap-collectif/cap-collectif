<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="debate_article")
 * @ORM\EntityListeners({"Capco\AppBundle\EventListener\DebateArticleListener"})
 * @ORM\Entity(repositoryClass=DebateArticleRepository::class)
 */
class DebateArticle implements EntityInterface
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"url"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $url;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $origin = null;

    /**
     * @ORM\Column(name="cover_url", type="string", length=255, nullable=true)
     */
    private ?string $coverUrl = null;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $title = null;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private ?string $description = null;

    /**
     * @ORM\Column(name="published_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $publishedAt = null;

    /**
     * @ORM\Column(name="crawled_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $crawledAt = null;

    /**
     * @ORM\ManyToOne(targetEntity=Debate::class, inversedBy="articles")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private ?Debate $debate = null;

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->createdAt = new \DateTimeImmutable();
            $this->updatedAt = null;
        }
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function hasBeenCrawled(): bool
    {
        return null !== $this->publishedAt;
    }

    public function getOrigin(): ?string
    {
        return $this->origin;
    }

    public function setOrigin(?string $origin): self
    {
        $this->origin = $origin;

        return $this;
    }

    public function getCoverUrl(): ?string
    {
        return $this->coverUrl;
    }

    public function setCoverUrl(?string $coverUrl): self
    {
        $this->coverUrl = $coverUrl;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getPublishedAt(): ?\DateTimeInterface
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(?\DateTimeInterface $publishedAt): self
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getCrawledAt(): ?\DateTimeInterface
    {
        return $this->crawledAt;
    }

    public function setCrawledAt(?\DateTimeInterface $crawledAt): self
    {
        $this->crawledAt = $crawledAt;

        return $this;
    }

    public function getDebate(): ?Debate
    {
        return $this->debate;
    }

    public function setDebate(?Debate $debate): self
    {
        $this->debate = $debate;

        return $this;
    }
}
