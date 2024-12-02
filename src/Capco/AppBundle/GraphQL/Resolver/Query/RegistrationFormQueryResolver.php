<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\RegistrationForm;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RegistrationFormQueryResolver implements QueryInterface
{
    public function __construct(private readonly RegistrationFormRepository $registrationFormRepository)
    {
    }

    public function __invoke(): ?RegistrationForm
    {
        return $this->registrationFormRepository->findCurrent();
    }
}
