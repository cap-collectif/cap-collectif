<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class ConsultationAdminUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Consultation $consultation): string
    {
        return $this->router->generate(
            'admin_capco_app_consultation_edit',
            ['id' => $consultation->getId()],
            RouterInterface::ABSOLUTE_URL
        );
    }
}
