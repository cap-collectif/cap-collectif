<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Doctrine\ORM\EntityNotFoundException;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ArgumentsController extends AbstractFOSRestController
{
    private $argumentRepository;
    private $globalIdResolver;

    public function __construct(ArgumentRepository $argumentRepository, GlobalIdResolver $globalIdResolver)
    {
        $this->argumentRepository = $argumentRepository;
        $this->globalIdResolver = $globalIdResolver;
    }

    /**
     * @Post("/opinions/{opinionId}/arguments/{argumentId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionArgumentReportAction(Request $request, string $opinionId, string $argumentId)
    {
        $viewer = $this->getUser();
        $opinion = $this->getOpinionFromGlobalId($opinionId, $viewer);
        $argument = $this->getArgumentFromGlobalId($argumentId);
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
     * @Entity("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionArgumentReportAction(
        Request $request,
        string $opinionId,
        OpinionVersion $version,
        string $argumentId
    ) {
        $viewer = $this->getUser();
        $opinion = $this->getOpinionFromGlobalId($opinionId, $viewer);
        $argument = $this->getArgumentFromGlobalId($argumentId);
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

    private function getOpinionFromGlobalId(string $opinionGlobalId, $viewer): Opinion
    {
        /** @var Opinion $opinion */
        $opinion = $this->globalIdResolver->resolve($opinionGlobalId, $viewer);

        if (null === $opinion) {
            throw new EntityNotFoundException('This opinion does not exist.');
        }

        return $opinion;
    }

    private function getArgumentFromGlobalId(string $argumentGlobalId): Argument
    {
        $argumentId = GlobalId::fromGlobalId($argumentGlobalId)['id'];
        /** @var Argument $argument */
        $argument = $this->argumentRepository->find($argumentId);

        if (null === $argument) {
            throw new EntityNotFoundException('This opinion does not exist.');
        }

        return $argument;
    }
}
