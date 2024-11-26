<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class ConsultationAdminUrlResolver implements QueryInterface
{
    private readonly RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
