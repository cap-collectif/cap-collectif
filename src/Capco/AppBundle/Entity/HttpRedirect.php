<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\HttpRedirectDuration;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(
 *     name="http_redirect",
 *     uniqueConstraints={@ORM\UniqueConstraint(name="uniq_http_redirect_source", columns={"source_url"})}
 * )
 * @ORM\Entity(repositoryClass=HttpRedirectRepository::class)
 */
class HttpRedirect implements EntityInterface
{
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private ?\DateTimeInterface $createdAt = null;

    /**
     * @ORM\Column(name="source_url", type="string", length=255)
     */
    private string $sourceUrl;

    /**
     * @ORM\Column(name="destination_url", type="text")
     */
    private string $destinationUrl;

    /**
     * @ORM\Column(name="duration", type="string", length=20)
     */
    private string $duration = HttpRedirectDuration::PERMANENT;

    /**
     * @ORM\Column(name="redirect_type", type="string", length=30)
     */
    private string $redirectType = HttpRedirectType::REDIRECTION;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $updatedAt = null;

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getSourceUrl(): string
    {
        return $this->sourceUrl;
    }

    public function setSourceUrl(string $sourceUrl): self
    {
        $this->sourceUrl = $sourceUrl;

        return $this;
    }

    public function getDestinationUrl(): string
    {
        return $this->destinationUrl;
    }

    public function setDestinationUrl(string $destinationUrl): self
    {
        $this->destinationUrl = $destinationUrl;

        return $this;
    }

    public function getDuration(): string
    {
        return $this->duration;
    }

    public function setDuration(string $duration): self
    {
        $this->duration = $duration;

        return $this;
    }

    public function getRedirectType(): string
    {
        return $this->redirectType;
    }

    public function setRedirectType(string $redirectType): self
    {
        $this->redirectType = $redirectType;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
