<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait MetaDescriptionCustomCodeTrait
{
    /**
     * @ORM\Column(name="meta_description", type="string", nullable=true, length=160)
     * @Assert\Length(max=160,
     *     maxMessage="argument.metadescription.max_length")
     */
    private $metaDescription;

    /**
     * @ORM\Column(name="custom_code", type="text", nullable=true)
     */
    private $customCode;

    public function getMetaDescription()
    {
        return $this->metaDescription;
    }

    public function setMetaDescription($metaDescription)
    {
        $this->metaDescription = $metaDescription;
    }

    public function getCustomCode()
    {
        return $this->customCode;
    }

    public function setCustomCode($customCode)
    {
        $this->customCode = $customCode;

        return $this;
    }
}
