<?php
namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Entity\Opinion;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class OpinionUrlResolver implements ResolverInterface
{
    private $consultationStepRepository;
    private $router;
    private $logger;

    public function __construct(
        ConsultationStepRepository $consultationStepRepository,
        Router $router,
        LoggerInterface $logger
    ) {
        $this->consultationStepRepository = $consultationStepRepository;
        $this->router = $router;
        $this->logger = $logger;
    }

    public function __invoke(Opinion $contribution): string
    {
        $step = $this->consultationStepRepository->getByOpinionId($contribution->getId());
        $project = $step->getProject();

        if (
            $project->getSlug() &&
            $step->getSlug() &&
            $contribution->getOpinionType()->getSlug() &&
            $contribution->getSlug()
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
