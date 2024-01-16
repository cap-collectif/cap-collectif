<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ConsultationUrlResolver implements QueryInterface
{
    protected RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(Consultation $consultation): string
    {
        return $this->router->generate(
            'app_project_consultations_show_consultation',
            [
                'projectSlug' => $consultation
                    ->getStep()
                    ->getProject()
                    ->getSlug(),
                'stepSlug' => $consultation->getStep()->getSlug(),
                'consultationSlug' => $consultation->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
