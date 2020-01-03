<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Notifier\ReportNotifier;
use Doctrine\ORM\EntityNotFoundException;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ArgumentsController extends AbstractFOSRestController
{
    private $globalIdResolver;

    public function __construct(GlobalIdResolver $globalIdResolver)
    {
        $this->globalIdResolver = $globalIdResolver;
    }

    /**
     * @Post("/opinions/{opinionId}/arguments/{argumentId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionArgumentReportAction(
        Request $request,
        string $opinionId,
        string $argumentId
    ) {
        $viewer = $this->getUser();
        $opinion = $this->getContributionFromGlobalId($opinionId, $viewer);
        /** @var Argument $argument */
        $argument = $this->getContributionFromGlobalId($argumentId, $viewer);
        if (!$viewer || 'anon.' === $viewer || $viewer === $argument->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($argument->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $argument);
    }

    /**
     * @Post("/opinions/{opinionId}/versions/{versionId}/arguments/{argumentId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionArgumentReportAction(
        Request $request,
        string $opinionId,
        string $versionId,
        string $argumentId
    ) {
        $viewer = $this->getUser();
        $opinion = $this->getContributionFromGlobalId($opinionId, $viewer);
        $version = $this->getContributionFromGlobalId($versionId, $viewer);
        $argument = $this->getContributionFromGlobalId($argumentId, $viewer);
        if (!$viewer || 'anon.' === $viewer || $viewer === $argument->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($argument->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $argument);
    }

    private function createReport(Request $request, Argument $argument)
    {
        $report = (new Reporting())->setReporter($this->getUser())->setArgument($argument);

        $form = $this->createForm(ReportingType::class, $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($report);
        $em->flush();
        $this->get(ReportNotifier::class)->onCreate($report);

        return $report;
    }

    private function getContributionFromGlobalId(
        string $contributionGlobalId,
        $viewer
    ): Contribution {
        $contribution = $this->globalIdResolver->resolve($contributionGlobalId, $viewer);

        if (null === $contribution) {
            throw new EntityNotFoundException('This contribution does not exist.');
        }

        return $contribution;
    }
}
