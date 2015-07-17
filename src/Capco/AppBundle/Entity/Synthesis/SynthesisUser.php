<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Synthesis.
 *
 * @ORM\Table(name="synthesis_user")
 * @ORM\Entity()
 */
class SynthesisUser implements SynthesisUserInterface
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="guid")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    private $id;

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
