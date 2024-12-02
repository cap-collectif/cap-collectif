<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ContactFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ContactFormQueryResolver implements QueryInterface
{
    public function __construct(private readonly ContactFormRepository $contactFormRepository)
    {
    }

    public function __invoke(): array
    {
        return $this->contactFormRepository->getAll();
    }
}
