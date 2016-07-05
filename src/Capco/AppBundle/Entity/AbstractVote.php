<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\HasAuthorInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Traits\ExpirableTrait;

/**
 * Class AbstractVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractVoteRepository")
* @ORM\Table(name="votes",indexes={})
 * @ORM\HasLifecycleCallbacks()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "voteType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "idea"            = "IdeaVote",
 *      "comment"         = "CommentVote",
 *      "opinion"         = "OpinionVote",
 *      "opinionVersion"  = "OpinionVersionVote",
 *      "argument"        = "ArgumentVote",
 *      "source"          = "SourceVote",
 *      "proposal"        = "ProposalVote"
 * })
 */
abstract class AbstractVote implements Contribution, HasAuthorInterface
{
    use ExpirableTrait;

    public function isIndexable()
    {
        return !$this->isExpired();
    }

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="votes")
     * @ORM\JoinColumn(name="voter_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $user;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
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
     * Get updatedAt.
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
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
