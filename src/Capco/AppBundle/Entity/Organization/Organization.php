<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\ProjectOwner;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\AppBundle\Traits\SluggableTranslatableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(
 *     name="organization"
 * )*
 * @ORM\Entity(repositoryClass=OrganizationRepository::class)
 */
class Organization implements Translatable, Author, ProjectOwner, IndexableInterface
{
    use SluggableTranslatableTitleTrait;
    use TimestampableTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="logo_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $logo;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="banner_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $banner;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Organization\OrganizationSocialNetworks", mappedBy="organization", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private ?OrganizationSocialNetworks $organizationSocialNetworks;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Organization\OrganizationMember", mappedBy="organization", cascade={"persist"}, orphanRemoval=true)
     */
    private $members;

    /**
     * @ORM\Column(name="email", type="string", nullable=true)
     */
    private ?string $email = null;

    /**
     * @ORM\Column(name="deleted_at", type="datetime", nullable=true)
     */
    private ?\DateTime $deletedAt = null;

    public function __construct()
    {
        $this->members = new ArrayCollection();
    }

    public function getBody(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBody();
    }

    public function setBody(?string $body = null): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
    }

    public function getOrganizationSocialNetworks(): ?OrganizationSocialNetworks
    {
        return $this->organizationSocialNetworks;
    }

    public function setOrganizationSocialNetworks(
        ?OrganizationSocialNetworks $organizationSocialNetworks
    ): void {
        $this->organizationSocialNetworks = $organizationSocialNetworks;
    }

    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function getMembership(User $user): ?OrganizationMember
    {
        foreach ($this->members as $member) {
            if ($member->getUser() === $user) {
                return $member;
            }
        }

        return null;
    }

    public function getUsersMember(): Collection
    {
        return $this->members->map(
            fn (OrganizationMember $organizationMember) => $organizationMember->getUser()
        );
    }

    public function isUserMember(User $user): bool
    {
        return $this->getUsersMember()->contains($user);
    }

    public function isUserAdmin(User $user): bool
    {
        $memberShip = $this->getMembership($user);

        return $memberShip && $memberShip->isAdmin();
    }

    public function setMembers(Collection $members): self
    {
        $this->members = $members;

        return $this;
    }

    public function addMember(OrganizationMember $member): self
    {
        if (!$this->members->contains($member)) {
            $this->members->add($member);
        }

        return $this;
    }

    public function removeMember(OrganizationMember $member): self
    {
        $this->members->removeElement($member);

        return $this;
    }

    public function countMembers(): int
    {
        return $this->members->count();
    }

    public function hasMembers(): bool
    {
        return !$this->members->isEmpty();
    }

    public function getLogo(): ?Media
    {
        return $this->logo;
    }

    public function setLogo(?Media $logo): self
    {
        $this->logo = $logo;

        return $this;
    }

    public function getBanner(): ?Media
    {
        return $this->banner;
    }

    public function setBanner(?Media $banner): self
    {
        $this->banner = $banner;

        return $this;
    }

    public function getWebPageUrl(): ?string
    {
        return $this->organizationSocialNetworks
            ? $this->organizationSocialNetworks->getWebPageUrl()
            : null;
    }

    public function getTwitterUrl(): ?string
    {
        return $this->organizationSocialNetworks
            ? $this->organizationSocialNetworks->getTwitterUrl()
            : null;
    }

    public function getFacebookUrl(): ?string
    {
        return $this->organizationSocialNetworks
            ? $this->organizationSocialNetworks->getFacebookUrl()
            : null;
    }

    public static function getTranslationEntityClass(): string
    {
        return OrganizationTranslation::class;
    }

    public function getUsername(): string
    {
        return $this->getTitle();
    }

    public function isViewer(?User $user): bool
    {
        return $this->members->contains($user);
    }

    public function getMedia(): ?Media
    {
        return $this->getLogo();
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getDeletedAt(): ?\DateTime
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTime $deletedAt): self
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }

    public static function getElasticsearchPriority(): int
    {
        return 100;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'organization';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public function getUserAdmin(): ?User
    {
        /** @var OrganizationMember $member */
        foreach ($this->getMembers() as $member) {
            if ($member->isAdmin()) {
                return $member->getUser();
            }
        }

        return null;
    }

    public function removeMembers(): void
    {
        foreach ($this->getMembers() as $member) {
            $this->removeMember($member);
        }
    }

    public function isDeleted(): bool
    {
        return null !== $this->deletedAt;
    }
}
