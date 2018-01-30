<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\HasAuthorInterface;
use Capco\AppBundle\Traits\ExpirableTrait;
use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractVoteRepository")
 * @ORM\Table(name="votes",indexes={})
 * @ORM\HasLifecycleCallbacks()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "voteType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "idea"              = "IdeaVote",
 *      "comment"           = "CommentVote",
 *      "opinion"           = "OpinionVote",
 *      "opinionVersion"    = "OpinionVersionVote",
 *      "argument"          = "ArgumentVote",
 *      "source"            = "SourceVote",
 *      "proposalSelection" = "ProposalSelectionVote",
 *      "proposalCollect"   = "ProposalCollectVote",
 * })
 */
abstract class AbstractVote implements Contribution, HasAuthorInterface
{
    use ExpirableTrait;
    use IdTrait;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="votes")
     * @ORM\JoinColumn(name="voter_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $user;

    public function getKind(): string
    {
        return 'vote';
    }

    public function getRelated()
    {
        return null;
    }

    public function isIndexable()
    {
        return !$this->isExpired() && ($this->getRelatedEntity() instanceof Proposal && !$this->getRelatedEntity()->isDeleted());
    }

    /**
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param $user
     *
     * @return $this
     */
    public function setUser($user)
    {
        $this->user = $user;

        return $this;
    }

    public function getAuthor()
    {
        return $this->user;
    }

    public function hasUser()
    {
        return (bool) $this->getUser();
    }

    abstract public function getRelatedEntity();
}
