<?php

namespace Capco\AppBundle\Entity\NotificationsConfiguration;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class AbstractNotificationConfiguration.
 *
 * @ORM\Table(name="notifications_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractNotificationConfigurationRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="entity", type="string")
 * @ORM\DiscriminatorMap({
 *      "proposalForm" = "ProposalFormNotificationConfiguration",
 *      "questionnaire" = "QuestionnaireNotificationConfiguration"
 * })
 */
abstract class AbstractNotificationConfiguration
{
    use IdTrait;

    /**
     * @ORM\Column(name="email", type="string", nullable=true)
     */
    private ?string $email = null;

    abstract public function getType();

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }
}
