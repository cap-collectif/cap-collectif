<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\CustomCodeVersionRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=CustomCodeVersionRepository::class)
 * @ORM\Table(name="custom_code_version", indexes={
 *     @ORM\Index(name="custom_code_version_keyname_created_at_idx", columns={"keyname", "created_at"})
 * })
 */
class CustomCodeVersion
{
    use UuidTrait;

    final public const TYPE_INITIAL = 'INITIAL';
    final public const TYPE_COMMIT = 'COMMIT';
    final public const TYPE_RESTORE = 'RESTORE';

    /**
     * @ORM\Column(name="keyname", type="string", length=255)
     */
    private string $keyname;

    /**
     * @ORM\Column(name="title", type="string", length=255)
     */
    private string $title;

    /**
     * @ORM\Column(name="author_name", type="string", length=120)
     */
    private string $authorName;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private ?string $description = null;

    /**
     * @ORM\Column(name="reference_url", type="string", length=2048, nullable=true)
     */
    private ?string $referenceUrl = null;

    /**
     * @ORM\Column(name="content", type="text", nullable=true)
     */
    private ?string $content = null;

    /**
     * @ORM\Column(name="content_hash", type="string", length=64)
     */
    private string $contentHash;

    /**
     * @ORM\Column(name="previous_content_hash", type="string", length=64, nullable=true)
     */
    private ?string $previousContentHash = null;

    /**
     * @ORM\Column(name="type", type="string", length=32)
     */
    private string $type;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\CustomCodeVersion")
     * @ORM\JoinColumn(name="restored_from_version_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?self $restoredFromVersion = null;

    /**
     * @ORM\Column(name="created_by_user_id", type="guid", nullable=true)
     */
    private ?string $createdByUserId = null;

    /**
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTime $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getKeyname(): string
    {
        return $this->keyname;
    }

    public function setKeyname(string $keyname): self
    {
        $this->keyname = $keyname;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getAuthorName(): string
    {
        return $this->authorName;
    }

    public function setAuthorName(string $authorName): self
    {
        $this->authorName = $authorName;

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

    public function getReferenceUrl(): ?string
    {
        return $this->referenceUrl;
    }

    public function setReferenceUrl(?string $referenceUrl): self
    {
        $this->referenceUrl = $referenceUrl;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getContentHash(): string
    {
        return $this->contentHash;
    }

    public function setContentHash(string $contentHash): self
    {
        $this->contentHash = $contentHash;

        return $this;
    }

    public function getPreviousContentHash(): ?string
    {
        return $this->previousContentHash;
    }

    public function setPreviousContentHash(?string $previousContentHash): self
    {
        $this->previousContentHash = $previousContentHash;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getRestoredFromVersion(): ?self
    {
        return $this->restoredFromVersion;
    }

    public function setRestoredFromVersion(?self $restoredFromVersion): self
    {
        $this->restoredFromVersion = $restoredFromVersion;

        return $this;
    }

    public function getCreatedByUserId(): ?string
    {
        return $this->createdByUserId;
    }

    public function setCreatedByUserId(?string $createdByUserId): self
    {
        $this->createdByUserId = $createdByUserId;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
