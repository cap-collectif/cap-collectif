<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="sso_configuration")
 * @ORM\Entity
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "ssoType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "oauth2"           = "Oauth2SSOConfiguration"
 * })
 */
abstract class AbstractSSOConfiguration
{
    use UuidTrait;
    use EnableTrait;

    /**
     * @ORM\Column(name="name", type="string", nullable=false)
     */
    protected $name;

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getKind(): string
    {
        return 'oauth2';
    }
}
