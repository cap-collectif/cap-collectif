<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait MetaDescriptionTrait
{
    /**
     * @ORM\Column(name="meta_description", type="string", nullable=true, length=160)
     * @Assert\Length(max=160,
     *     maxMessage="argument.metadescription.max_length")
     */
    private $metaDescription;

    public function getMetaDescription(): ?string
    {
        return $this->metaDescription;
    }

    public function setMetaDescription(string $metaDescription = null): self
    {
        $this->metaDescription = $metaDescription;

        return $this;
    }
}
