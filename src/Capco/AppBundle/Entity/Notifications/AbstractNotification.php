<?php

namespace Capco\AppBundle\Entity\Notifications;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class AbstractNotification
 *
 * @ORM\Table(name="notifications")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractNotificationRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="entity", type="string")
 * @ORM\DiscriminatorMap({
 *      "proposalForm" = "ProposalFormNotification"
 * })
 */
abstract class AbstractNotification
{
    use IdTrait;

    abstract public function getType();
}
