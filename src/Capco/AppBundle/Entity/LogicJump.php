<?php
namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="logic_jump")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\LogicJumpRepository")
 */
class LogicJump
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion", inversedBy="jumps")
     * @ORM\JoinColumn(nullable=false)
     */
    protected $origin;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion")
     */
    protected $destination;

    /**
     * @ORM\OneToMany(targetEntity="AbstractLogicJumpCondition", mappedBy="jump", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $conditions;

    public function __construct()
    {
        $this->conditions = new ArrayCollection();
    }

    public function getOrigin(): ?AbstractQuestion
    {
        return $this->origin;
    }

    public function setOrigin(?AbstractQuestion $origin): self
    {
        $this->origin = $origin;

        return $this;
    }

    public function getDestination(): ?AbstractQuestion
    {
        return $this->destination;
    }

    public function setDestination(?AbstractQuestion $destination): self
    {
        $this->destination = $destination;

        return $this;
    }

    /**
     * @return Collection|AbstractLogicJumpCondition[]
     */
    public function getConditions(): Collection
    {
        return $this->conditions;
    }

    public function addCondition(AbstractLogicJumpCondition $condition): self
    {
        if (!$this->conditions->contains($condition)) {
            $this->conditions[] = $condition;
            $condition->setJump($this);
        }

        return $this;
    }

    public function removeCondition(AbstractLogicJumpCondition $condition): self
    {
        if ($this->conditions->contains($condition)) {
            $this->conditions->removeElement($condition);
            // set the owning side to null (unless already changed)
            if ($condition->getJump() === $this) {
                $condition->setJump(null);
            }
        }

        return $this;
    }
}
