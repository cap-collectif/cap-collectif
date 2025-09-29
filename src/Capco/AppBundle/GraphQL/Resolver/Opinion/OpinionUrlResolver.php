<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class OpinionUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly ConsultationStepRepository $consultationStepRepository,
        private readonly RouterInterface $router,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Opinion $contribution): string
    {
        $step = $this->consultationStepRepository->getByOpinionId($contribution->getId());
        $project = $step ? $step->getProject() : null;
        if (
            $project
            && $project->getSlug()
            && $step->getSlug()
            && $contribution->getSlug()
            && $contribution->getOpinionType()->getSlug()
        ) {
            return $this->router->generate(
                'app_consultation_show_opinion',
                [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $contribution->getOpinionType()->getSlug(),
                    'opinionSlug' => $contribution->getSlug(),
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        $this->logger->warning(
            'Opinion ' . $contribution->getId() . ' cannot have his url generated.'
        );

        return '';
    }
}
