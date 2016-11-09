<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\UuidTrait;

/**
 * @ORM\Table(name="synthesis_user")
 * @ORM\Entity()
 */
class SynthesisUser implements SynthesisUserInterface
{
    use UuidTrait;

    /**
     * @var string
     * @ORM\Column(name="display_name", type="string", length=255)
     * @Assert\NotNull
     */
    private $displayName;

    /**
     * @var string
     * @ORM\Column(name="unique_identifier", type="string", length=255)
     * @Assert\NotNull
     */
    private $uniqueIdentifier;

    /**
     * @var string
     * @ORM\Column(name="is_admin", type="boolean")
     */
    private $isAdmin;

    /**
     * @return mixed
     */
    public function getDisplayName()
    {
        return $this->displayName;
    }

    /**
     * @param mixed $displayName
     */
    public function setDisplayName($displayName)
    {
        $this->displayName = $displayName;
    }

    /**
     * @return mixed
     */
    public function getUniqueIdentifier()
    {
        return $this->uniqueIdentifier;
    }

    /**
     * @param mixed $uniqueIdentifier
     */
    public function setUniqueIdentifier($uniqueIdentifier)
    {
        $this->uniqueIdentifier = $uniqueIdentifier;
    }

    /**
     * @return mixed
     */
    public function isAdmin()
    {
        return $this->isAdmin;
    }

    /**
     * @param mixed $isAdmin
     */
    public function setIsAdmin($isAdmin)
    {
        $this->isAdmin = $isAdmin;
    }

    // ************************* Methods needed by the SynthesisUserInterface ****************

    /**
     * Get media.
     *
     * @return Media or null
     */
    public function getMedia()
    {
        return;
    }
}
