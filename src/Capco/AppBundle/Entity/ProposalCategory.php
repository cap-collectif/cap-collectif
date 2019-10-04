<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="proposal_category")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalCategoryRepository")
 */
class ProposalCategory
{
    use UuidTrait;
    use TimestampableTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="name", type="string", length=100)
     */
    private $name;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="categories", cascade={"persist"})
     * @ORM\JoinColumn(name="form_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $form;

    /**
     * @ORM\OneToMany(
     *    targetEntity="Capco\AppBundle\Entity\Proposal",
     *    mappedBy="category",
     *    cascade={"persist"}
     *  )
     */
    private $proposals;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\CategoryImage", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="category_media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $categoryImage;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->createdAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getName() : 'New category';
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getForm(): ?ProposalForm
    {
        return $this->form;
    }

    public function setForm(ProposalForm $form)
    {
        $this->form = $form;

        return $this;
    }

    public function getProposals()
    {
        return $this->proposals;
    }

    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);

        return $this;
    }

    public function getCategoryImage(): ?CategoryImage
    {
        return $this->categoryImage;
    }

    public function setCategoryImage(?CategoryImage $categoryImage = null): self
    {
        $this->categoryImage = $categoryImage;

        return $this;
    }
}
