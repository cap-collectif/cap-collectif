<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class OpinionController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}", name="app_project_show_opinions", requirements={"page" = "\d+", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}/sort/{opinionsSort}/", name="app_project_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions|random", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}", name="app_consultation_show_opinions", requirements={"page" = "\d+", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/page/{page}/sort/{opinionsSort}", name="app_consultation_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions|random", "opinionTypeSlug" = ".+"}, defaults={"page" = 1})
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("currentStep", class="CapcoAppBundle:Steps\ConsultationStep", options={"mapping": {"stepSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_by_type.html.twig")
     */
    public function showByTypeAction(
        Project $project,
        int $page,
        string $opinionTypeSlug,
        Request $request,
        ConsultationStep $currentStep,
        string $opinionsSort = null
    ) {
        if (!$currentStep->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $opinionTypesResolver = $this->get(OpinionTypesResolver::class);
        $opinionType = $opinionTypesResolver->findByStepAndSlug($currentStep, $opinionTypeSlug);

        $filter = $opinionsSort ?: $opinionType->getDefaultFilter();
        $currentUrl = $this->generateUrl('app_consultation_show_opinions', [
            'projectSlug' => $project->getSlug(),
            'stepSlug' => $currentStep->getSlug(),
            'opinionTypeSlug' => $opinionType->getSlug(),
            'page' => $page,
        ]);
        $opinions = $this->get(OpinionRepository::class)->getByOpinionTypeOrdered(
            $opinionType->getId(),
            10,
            $page,
            $filter
        );

        return [
            'currentUrl' => $currentUrl,
            'project' => $project,
            'opinionType' => $opinionType,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(\count($opinions) / 10),
            'opinionsSort' => $filter,
            'opinionSortOrders' => Opinion::$sortCriterias,
            'currentStep' => $currentStep,
            'currentRoute' => $request->get('_route'),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}", name="app_project_show_opinion_version", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}", name="app_consultation_show_opinion_version", requirements={"opinionTypeSlug" = ".+"})
     * @Template("CapcoAppBundle:Opinion:show_version.html.twig")
     */
    public function showOpinionVersionAction(
        string $projectSlug,
        string $stepSlug,
        string $opinionTypeSlug,
        string $opinionSlug,
        string $versionSlug
    ) {
        $opinion = $this->get(OpinionRepository::class)->findOneBySlug($opinionSlug);
        $version = $this->get('capco.opinion_version.repository')->findOneBySlug($versionSlug);

        if (!$opinion || !$version) {
            throw $this->createNotFoundException(
                $this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle')
            );
        }
        if (!$version->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }
        $currentStep = $opinion->getStep();

        return [
            'version' => $version,
            'opinion' => $opinion,
            'currentStep' => $currentStep,
            'project' => $currentStep->getProject(),
            'opinionType' => $opinion->getOpinionType(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_project_show_opinion", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_consultation_show_opinion", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_project_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date", "opinionTypeSlug" = ".+"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_consultation_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date", "opinionTypeSlug" = ".+"})
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     */
    public function showOpinionAction(
        string $projectSlug,
        string $stepSlug,
        string $opinionTypeSlug,
        string $opinionSlug
    ) {
        /** @var Opinion $opinion */
        $opinion = $this->get(OpinionRepository::class)->findOneBySlug($opinionSlug);

        if (!$opinion) {
            throw $this->createNotFoundException(
                $this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle')
            );
        }
        if (!$opinion->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }
        $currentStep = $opinion->getStep();

        return [
            'currentStep' => $currentStep,
            'project' => $currentStep->getProject(),
            'opinion' => $opinion,
            'opinionType' => $opinion->getOpinionType(),
        ];
    }
}
