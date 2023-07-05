<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait DescriptionUsingJoditWysiwygTrait
{
    /**
     * @ORM\Column(name="description_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    protected bool $descriptionUsingJoditWysiwyg = false;

    public function isDescriptionUsingJoditWysiwyg(): bool
    {
        return $this->descriptionUsingJoditWysiwyg;
    }

    public function setDescriptionUsingJoditWysiwyg(bool $descriptionUsingJoditWysiwyg): self
    {
        $this->descriptionUsingJoditWysiwyg = $descriptionUsingJoditWysiwyg;

        return $this;
    }
}
