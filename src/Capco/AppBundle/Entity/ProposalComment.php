<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class ProposalComment.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalCommentRepository")
 */
class ProposalComment extends AbstractComment
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

    /**
     * @param Proposal $proposal
     *
     * @return $this
     */
    public function setProposal(Proposal $proposal)
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
        return $this->getProposal();
    }

    /**
     * @param $object
     *
     * @return Proposal
     */
    public function setRelatedObject($object)
    {
        return $this->setProposal($object);
    }
}
