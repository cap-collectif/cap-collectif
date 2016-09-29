<?php

namespace Capco\AppBundle\Entity\NotificationsConfiguration;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class AbstractNotificationConfiguration
 *
 * @ORM\Table(name="notifications_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractNotificationConfigurationRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="entity", type="string")
 * @ORM\DiscriminatorMap({
 *      "proposalForm" = "ProposalFormNotificationConfiguration"
 * })
 */
abstract class AbstractNotificationConfiguration
{
    use IdTrait;

    abstract public function getType();
}
