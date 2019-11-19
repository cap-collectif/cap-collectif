<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class OpinionController extends Controller
{
    private $logger;
    private $repository;

    public function __construct(LoggerInterface $logger, OpinionTypeRepository $repository)
    {
        $this->logger = $logger;
        $this->repository = $repository;
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/{consultationSlug}/types/{opinionTypeSlug}", name="app_project_show_opinions", requirements={"opinionTypeSlug" = ".+", "consultationSlug" = ".+"})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/{consultationSlug}/types/{opinionTypeSlug}", name="app_project_show_opinions_2", requirements={"opinionTypeSlug" = ".+", "consultationSlug" = ".+"})
     *
     * Legacy URLs :
     *
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}", name="legacy_app_project_show_opinions1", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}", name="legacy_app_project_show_opinions_2", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}", name="legacy_app_project_show_opinions", requirements={"page" = "\d+", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}/sort/{opinionsSort}/", name="legacy_app_project_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions|random", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}", name="legacy_app_consultation_show_opinions", requirements={"page" = "\d+", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}/sort/{opinionsSort}", name="legacy_app_consultation_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions|random", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     *
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *      "mapping" = {"projectSlug": "slug"},
     *      "repository_method"= "getOneWithoutVisibility",
     *      "map_method_signature" = true
     * })
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={
     *    "mapping": {"stepSlug": "stepSlug", "projectSlug": "projectSlug", "consultationSlug": "consultationSlug"},
     *    "repository_method"="findOneBySlugs",
     *    "map_method_signature"=true
     * })
     * @Template("CapcoAppBundle:Consultation:SectionPage.html.twig")
     */
    public function sectionPageAction(
        Request $request,
        Project $project,
        string $opinionTypeSlug,
        ConsultationStep $step,
        ?Consultation $consultation = null
    )
    {
        if (!$step->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        if (!$consultation) {
            if ($step->isMultiConsultation()) {
                // We are in a case when a legacy url has been shared, but at this point we can not determine in which
                // consultation we are, so we redirect in the first consultation but we log because it should normally
                // not happen
                $this->logger->warning(
                    'Trying to access a legacy url for showing an OpinionType in the multi consultation step.', ['step' => $step->getTitle(), 'url' => $request->getUri()]
                );

            }
            return $this->redirectToRoute('app_project_show_opinions', [
                'opinionTypeSlug' => $opinionTypeSlug,
                'stepSlug' => $step->getSlug(),
                'projectSlug' => $project->getSlug(),
                'consultationSlug' => $step->getFirstConsultation()->getSlug()
            ]);
        }

        $opinionType = $this->repository->findOneByConsultationAndStepAndSlug($consultation, $step, $opinionTypeSlug);

        return [
            'project' => $project,
            'navigationStepProps' => [
                'id' => GlobalId::toGlobalId('ConsultationStep', $step->getId()),
                'consultationSlug' => $consultation->getSlug()
            ],
            'opinionType' => $opinionType,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}", name="app_project_show_opinion_version", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}", name="app_consultation_show_opinion_version", requirements={"opinionTypeSlug" = ".+"})
     *
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *      "mapping" = {"projectSlug": "slug"},
     *      "repository_method"= "getOneWithoutVisibility",
     *      "map_method_signature" = true
     * })
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={
     *      "mapping" = {"opinionSlug": "slug", "stepSlug": "stepSlug", "projectSlug": "projectSlug"},
     *      "repository_method"= "getOneBySlugAndProjectSlugAndStepSlug",
     *      "map_method_signature" = true
     * })
     * @ParamConverter("version", class="CapcoAppBundle:OpinionVersion", options={
     *  "mapping" = {
     *      "versionSlug": "slug",
     *      "opinionSlug": "opinionSlug",
     *      "stepSlug": "stepSlug",
     *      "projectSlug": "projectSlug"
     *  },
     *  "repository_method"= "getOneBySlugAndProjectSlugAndStepSlugAndOpinionSlug",
     *  "map_method_signature" = true
     * })
     *
     * @Template("CapcoAppBundle:Opinion:show_version.html.twig")
     */
    public function showOpinionVersionAction(
        Project $project,
        ConsultationStep $step,
        string $opinionTypeSlug,
        Opinion $opinion,
        OpinionVersion $version
    )
    {
        if (!$version->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $cstepGlobalId = GlobalId::toGlobalId('ConsultationStep', $step->getId());

        return [
            'version' => $version,
            'opinion' => $opinion,
            'navigationStepProps' => [
                'id' => $cstepGlobalId,
                'consultationSlug' => $opinion->getConsultation()->getSlug()
            ],
            'currentStep' => $step,
            'project' => $project,
            'opinionType' => $opinion->getOpinionType(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_project_show_opinion", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_consultation_show_opinion", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_project_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date", "opinionTypeSlug" = ".+"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_consultation_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date", "opinionTypeSlug" = ".+"})
     *
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *      "mapping" = {"projectSlug": "slug"},
     *      "repository_method"= "getOneWithoutVisibility",
     *      "map_method_signature" = true
     * })
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping" = {"opinionSlug": "slug", "stepSlug": "stepSlug", "projectSlug": "projectSlug"}, "repository_method"= "getOneBySlugAndProjectSlugAndStepSlug", "map_method_signature" = true})
     *
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     */
    public function showOpinionAction(
        Project $project,
        ConsultationStep $step,
        string $opinionTypeSlug,
        Opinion $opinion
    )
    {
        if (!$opinion->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'currentStep' => $step,
            'navigationStepProps' => [
                'id' => GlobalId::toGlobalId('ConsultationStep', $step->getId()),
                'consultationSlug' => $opinion->getConsultation()->getSlug()
            ],
            'project' => $project,
            'opinion' => $opinion,
            'opinionType' => $opinion->getOpinionType(),
        ];
    }
}
