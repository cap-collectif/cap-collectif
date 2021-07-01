<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Mailer\SenderEmailDomains\SenderEmailDomainsManager;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SenderEmailDomainResolver implements ResolverInterface
{
    private SenderEmailDomainsManager $manager;

    public function __construct(SenderEmailDomainsManager $manager)
    {
        $this->manager = $manager;
    }

    public function __invoke(): array
    {
        return $this->manager->getSenderEmailDomains();
    }
}
