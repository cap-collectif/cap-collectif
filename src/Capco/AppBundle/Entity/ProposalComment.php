<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class ProposalComment.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalCommentRepository")
 */
class ProposalComment extends Comment
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="comments", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private $proposal;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        $proposal->addComment($this);

        return $this;
    }

    // ************************ Overriden methods *********************************

    /**
     * @return Proposal
     */
    public function getRelatedObject()
    {
        return $this->proposal;
    }

    public function setRelatedObject($object)
    {
        return $this->setProposal($object);
    }
}
