<?php

namespace Capco\AppBundle\Entity\Synthesis;

/**
 * SynthesisUserInterface.
 */
interface SynthesisUserInterface
{
    /**
     * Get unique identifier.
     *
     * @return int
     */
    public function getUniqueIdentifier();

    /**
     * Get display name.
     *
     * @return string
     */
    public function getDisplayName();

    /**
     * Get media.
     *
     * @return Media or null
     */
    public function getMedia();
}
