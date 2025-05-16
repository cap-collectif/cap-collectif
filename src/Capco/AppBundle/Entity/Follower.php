<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="user_following",
 *    uniqueConstraints={
 *      @UniqueConstraint(name="follower_unique_proposal",columns={"user_id", "proposal_id"}),
 *      @UniqueConstraint(name="follower_unique_project_district",columns={"user_id", "project_district_id"}),
 *      @UniqueConstraint(name="follower_unique_opinion",columns={"user_id", "opinion_id"}),
 *    }
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\FollowerRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Follower implements EntityInterface, IndexableInterface
{
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="followed_at",type="datetime", nullable=false)
     */
    protected $followedAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="followingContributions")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    protected $user;

    /**
     * @var Proposal
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="followers")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $proposal;

    /**
     * @var Opinion
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="followers")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $opinion;

    /**
     * @var OpinionVersion
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionVersion", inversedBy="followers")
     * @ORM\JoinColumn(name="opinion_version_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?OpinionVersion $opinionVersion = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District\GlobalDistrict", inversedBy="followers")
     * @ORM\JoinColumn(name="project_district_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?GlobalDistrict $globalDistrict = null;

    /**
     * @ORM\Column(name="notified_of", columnDefinition="ENUM('MINIMAL', 'ESSENTIAL', 'ALL')", nullable=true)
     * @Assert\Choice(choices = {"MINIMAL", "ESSENTIAL", "ALL"})
     */
    protected $notifiedOf;

    public function getFollowedAt(): \DateTime
    {
        return $this->followedAt;
    }

    public function setFollowedAt(\DateTime $followedAt): self
    {
        $this->followedAt = $followedAt;

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        $user->addFollowingContribution($this);

        return $this;
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(?Proposal $proposal = null): self
    {
        if (!$proposal && $this->proposal) {
            $this->proposal->removeFollower($this);
        }

        $this->proposal = $proposal;

        if ($proposal) {
            $proposal->addFollower($this);
        }

        return $this;
    }

    public function getOpinion(): ?Opinion
    {
        return $this->opinion;
    }

    public function setOpinion(?Opinion $opinion = null): self
    {
        if (!$opinion && $this->opinion) {
            $this->opinion->removeFollower($this);
        }

        $this->opinion = $opinion;

        if ($opinion) {
            $opinion->addFollower($this);
        }

        return $this;
    }

    public function getGlobalDistrict(): ?GlobalDistrict
    {
        return $this->globalDistrict;
    }

    public function setGlobalDistrict(?GlobalDistrict $globalDistrict): self
    {
        if (!$globalDistrict && $this->globalDistrict) {
            $this->globalDistrict->removeFollower($this);
        }

        $this->globalDistrict = $globalDistrict;

        if ($globalDistrict) {
            $globalDistrict->addFollower($this);
        }

        return $this;
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteFollower(): void
    {
        if ($this->proposal) {
            $this->proposal->removeFollower($this);
        }

        if ($this->opinion) {
            $this->opinion->removeFollower($this);
        }

        if ($this->opinionVersion) {
            $this->opinionVersion->removeFollower($this);
        }

        if ($this->globalDistrict) {
            $this->globalDistrict->removeFollower($this);
        }
    }

    public function getNotifiedOf(): ?string
    {
        return $this->notifiedOf;
    }

    public function setNotifiedOf(string $notifiedOf): self
    {
        $this->notifiedOf = $notifiedOf;

        return $this;
    }

    public function getOpinionVersion(): ?OpinionVersion
    {
        return $this->opinionVersion;
    }

    public function setOpinionVersion(OpinionVersion $opinionVersion): self
    {
        if (!$opinionVersion && $this->opinionVersion) {
            $this->opinionVersion->removeFollower($this);
        }

        $this->opinionVersion = $opinionVersion;

        if ($opinionVersion) {
            $opinionVersion->addFollower($this);
        }

        return $this;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'follower';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchFollower',
            'ElasticsearchFollowerNestedAuthor',
            'ElasticsearchNestedProposal',
            'ElasticsearchFollowerNestedOpinion',
            'ElasticsearchFollowerNestedVersion',
            'ElasticsearchProposalNestedProject',
            'ElasticsearchVersionNestedProject',
            'ElasticsearchOpinionNestedProject',
        ];
    }

    public static function getElasticsearchPriority(): int
    {
        return 5;
    }
}
