<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ParticipantRequirementRepository;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RequirementViewerValueResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly UserRequirementRepository $userRequirementsRepo, private readonly ParticipantRequirementRepository $participantRequirementRepo)
    {
    }

    /**
     * Returns a string, a GoogleMapsAddress or a bool.
     *
     * @param mixed $contributor
     */
    public function __invoke(Requirement $requirement, ContributorInterface $contributor)
    {
        $contributor = $this->preventNullableViewer($contributor);

        if (Requirement::FIRSTNAME === $requirement->getType()) {
            return $contributor->getFirstname();
        }
        if (Requirement::LASTNAME === $requirement->getType()) {
            return $contributor->getLastname();
        }
        if (Requirement::PHONE === $requirement->getType()) {
            return $contributor->getPhone();
        }
        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return $contributor->getDateOfBirth();
        }
        if (Requirement::POSTAL_ADDRESS === $requirement->getType()) {
            return $contributor->getPostalAddress();
        }
        if (Requirement::IDENTIFICATION_CODE === $requirement->getType()) {
            return $contributor->getUserIdentificationCodeValue();
        }
        if (Requirement::PHONE_VERIFIED === $requirement->getType()) {
            return $contributor->isPhoneConfirmed();
        }
        if ($contributor instanceof User && Requirement::FRANCE_CONNECT === $requirement->getType()) {
            return $contributor->getFranceConnectId();
        }

        if (Requirement::CHECKBOX === $requirement->getType()) {
            if ($contributor instanceof User) {
                $found = $this->userRequirementsRepo->findOneBy([
                    'requirement' => $requirement,
                    'user' => $contributor,
                ]);

                return $found ? $found->getValue() : false;
            }

            if ($contributor instanceof Participant) {
                $found = $this->participantRequirementRepo->findOneBy([
                    'requirement' => $requirement,
                    'participant' => $contributor,
                ]);

                return $found ? $found->getValue() : false;
            }
        }

        return false;
    }
}
