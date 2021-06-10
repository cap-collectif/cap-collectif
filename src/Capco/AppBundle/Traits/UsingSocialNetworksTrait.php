<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait UsingSocialNetworksTrait
{
    /**
     * @ORM\Column(name="using_web_page", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingWebPage = false;

    /**
     * @ORM\Column(name="using_facebook", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingFacebook = false;

    /**
     * @ORM\Column(name="using_twitter", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingTwitter = false;

    /**
     * @ORM\Column(name="using_instagram", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingInstagram = false;

    /**
     * @ORM\Column(name="using_linked_in", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingLinkedIn = false;

    /**
     * @ORM\Column(name="using_youtube", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingYoutube = false;

    public function isUsingWebPage(): bool
    {
        return $this->usingWebPage;
    }

    public function setUsingWebPage(bool $usingWebPage): self
    {
        $this->usingWebPage = $usingWebPage;

        return $this;
    }

    public function isUsingFacebook(): bool
    {
        return $this->usingFacebook;
    }

    public function setUsingFacebook(bool $usingFacebook): self
    {
        $this->usingFacebook = $usingFacebook;

        return $this;
    }

    public function isUsingTwitter(): bool
    {
        return $this->usingTwitter;
    }

    public function setUsingTwitter(bool $usingTwitter): self
    {
        $this->usingTwitter = $usingTwitter;

        return $this;
    }

    public function isUsingInstagram(): bool
    {
        return $this->usingInstagram;
    }

    public function setUsingInstagram(bool $usingInstagram): self
    {
        $this->usingInstagram = $usingInstagram;

        return $this;
    }

    public function isUsingLinkedIn(): bool
    {
        return $this->usingLinkedIn;
    }

    public function setUsingLinkedIn(bool $usingLinkedIn): self
    {
        $this->usingLinkedIn = $usingLinkedIn;

        return $this;
    }

    public function isUsingYoutube(): bool
    {
        return $this->usingYoutube;
    }

    public function setUsingYoutube(bool $usingYoutube): self
    {
        $this->usingYoutube = $usingYoutube;

        return $this;
    }

    public function isUsingAnySocialNetworks(): bool
    {
        return $this->usingYoutube ||
            $this->usingWebPage ||
            $this->usingTwitter ||
            $this->usingFacebook ||
            $this->usingInstagram ||
            $this->usingLinkedIn;
    }
}
