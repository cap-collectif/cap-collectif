<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait BodyUsingJoditWysiwygTrait
{
    /**
     * @ORM\Column(name="body_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    private bool $bodyUsingJoditWysiwyg = false;

    public function isBodyUsingJoditWysiwyg(): bool
    {
        return $this->bodyUsingJoditWysiwyg;
    }

    public function setBodyUsingJoditWysiwyg(bool $bodyUsingJoditWysiwyg): self
    {
        $this->bodyUsingJoditWysiwyg = $bodyUsingJoditWysiwyg;
        return $this;
    }
}
