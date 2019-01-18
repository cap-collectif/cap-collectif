<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class RequirementViewerValueResolver implements ResolverInterface
{
    private $userRequirementsRepo;

    public function __construct(UserRequirementRepository $userRequirementsRepo)
    {
        $this->userRequirementsRepo = $userRequirementsRepo;
    }

    /**
     * Returns a string or a bool.
     */
    public function __invoke(Requirement $requirement, User $user)
    {
        if (Requirement::FIRSTNAME === $requirement->getType()) {
            return $user->getFirstname();
        }
        if (Requirement::LASTNAME === $requirement->getType()) {
            return $user->getLastname();
        }
        if (Requirement::PHONE === $requirement->getType()) {
            return $user->getPhone();
        }
        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return $user->getDateOfBirth();
        }

        if (Requirement::CHECKBOX === $requirement->getType()) {
            $found = $this->userRequirementsRepo->findOneBy([
                'requirement' => $requirement,
                'user' => $user,
            ]);

            return $found ? $found->getValue() : false;
        }
    }
}
