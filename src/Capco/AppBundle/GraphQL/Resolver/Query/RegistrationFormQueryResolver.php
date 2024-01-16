<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\RegistrationForm;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RegistrationFormQueryResolver implements QueryInterface
{
    private $registrationFormRepository;

    public function __construct(RegistrationFormRepository $registrationFormRepository)
    {
        $this->registrationFormRepository = $registrationFormRepository;
    }

    public function __invoke(): ?RegistrationForm
    {
        return $this->registrationFormRepository->findCurrent();
    }
}
