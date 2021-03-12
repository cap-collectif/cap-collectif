<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Enum\ContributionOrigin;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait ContributionOriginTrait
{
    /**
     * @ORM\Column(name="widget_origin_url", type="string", nullable=true)
     */
    protected ?string $widgetOriginUrl = null;

    /**
     * @ORM\Column(name="external_origin", type="string", columnDefinition="ENUM('MAIL', 'WIDGET')", nullable=true)
     * @Assert\Choice(choices=ContributionOrigin::ALL_EXTERNAL)
     */
    protected ?string $externalOrigin = null;

    public function getOrigin(): string
    {
        return $this->externalOrigin ?? ContributionOrigin::INTERNAL;
    }

    public function getWidgetOriginUrl(): ?string
    {
        return $this->widgetOriginUrl;
    }

    public function setInternalOrigin(): self
    {
        $this->widgetOriginUrl = null;
        $this->externalOrigin = null;

        return $this;
    }

    public function setMailOrigin(): self
    {
        $this->widgetOriginUrl = null;
        $this->externalOrigin = ContributionOrigin::MAIL;

        return $this;
    }

    public function setWidgetOriginUrl(string $url): self
    {
        $this->widgetOriginUrl = $url;
        $this->externalOrigin = ContributionOrigin::WIDGET;

        return $this;
    }
}
