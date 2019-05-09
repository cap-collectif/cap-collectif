<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="sso_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractSSOConfigurationRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "ssoType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "oauth2"           = "Oauth2SSOConfiguration"
 * })
 */
abstract class AbstractSSOConfiguration
{
    use UuidTrait;

    public function getKind(): string
    {
        return 'oauth2';
    }
}
