<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Timestampable;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalAnalystRepository")
 * @ORM\Table(name="proposal_analyst")
 */
class ProposalAnalyst implements Timestampable
{
    use TimestampableTrait;
    
    /**
     * @ORM\Id()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="analysts")
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id", name="proposal_id")
     */
    private $proposal;
    
    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="assigned_by", nullable=true)
     */
    private $assignedBy;
    
    /**
     * @ORM\Id()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id", name="analyst_id")
     */
    private $analyst;
    
    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private $updatedAt;
    
    public function __construct(Proposal $proposal, User $analyst)
    {
        $this->analyst = $analyst;
        $this->proposal = $proposal;
    }
    
    public function getProposal(): Proposal
    {
        return $this->proposal;
    }
    
    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        
        return $this;
    }
    
    public function getAssignedBy(): ?User
    {
        return $this->assignedBy;
    }
    
    public function setAssignedBy(?User $assignedBy = null): self
    {
        $this->assignedBy = $assignedBy;
        
        return $this;
    }
    
    public function getAnalyst(): User
    {
        return $this->analyst;
    }
    
    public function setAnalyst(User $analyst): self
    {
        $this->analyst = $analyst;
        
        return $this;
    }
}
