<?php

namespace Capco\AppBundle\Entity\Synthesis;

use Capco\MediaBundle\Entity\Media;

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
     * Tell if user is admin or not.
     *
     * @return bool
     */
    public function isAdmin();

    /**
     * Get media.
     *
     * @return Media|null
     */
    public function getMedia();
}
