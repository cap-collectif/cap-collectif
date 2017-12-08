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

    /**
     * @return string
     */
    public function getMetaDescription()
    {
        return $this->metaDescription;
    }

    /**
     * @param string $metaDescription
     */
    public function setMetaDescription($metaDescription)
    {
        $this->metaDescription = $metaDescription;
    }
}
