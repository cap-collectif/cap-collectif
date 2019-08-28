<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class RequirementViewerValueResolver implements ResolverInterface
{
    use ResolverTrait;

    private $userRequirementsRepo;

    public function __construct(UserRequirementRepository $userRequirementsRepo)
    {
        $this->userRequirementsRepo = $userRequirementsRepo;
    }

    /**
     * Returns a string or a bool.
     */
    public function __invoke(Requirement $requirement, ?User $viewer)
    {
        $viewer = $this->preventNullableViewer($viewer);

        if (Requirement::FIRSTNAME === $requirement->getType()) {
            return $viewer->getFirstname();
        }
        if (Requirement::LASTNAME === $requirement->getType()) {
            return $viewer->getLastname();
        }
        if (Requirement::PHONE === $requirement->getType()) {
            return $viewer->getPhone();
        }
        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return $viewer->getDateOfBirth();
        }

        if (Requirement::CHECKBOX === $requirement->getType()) {
            $found = $this->userRequirementsRepo->findOneBy([
                'requirement' => $requirement,
                'user' => $viewer
            ]);

            return $found ? $found->getValue() : false;
        }
    }
}
