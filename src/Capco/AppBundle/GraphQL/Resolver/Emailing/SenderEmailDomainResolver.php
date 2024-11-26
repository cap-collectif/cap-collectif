<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Mailer\SenderEmailDomains\SenderEmailDomainsManager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SenderEmailDomainResolver implements QueryInterface
{
    private readonly SenderEmailDomainsManager $manager;

    public function __construct(SenderEmailDomainsManager $manager)
    {
        $this->manager = $manager;
    }

    public function __invoke(): array
    {
        return $this->manager->getSenderEmailDomains();
    }
}
