<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGenerator;

class OpinionController extends Controller
{
    /**
     * @Template("CapcoAppBundle:Consultation:show_opinions.html.twig")
     */
    public function showOpinionsAction(Project $project, ConsultationStep $currentStep)
    {
        $tree = $this->get('capco.opinion_types.resolver')
            ->getGroupedOpinionsForStep($currentStep);

        return [
            'blocks' => $tree,
            'project' => $project,
            'currentStep' => $currentStep,
            'opinionSortOrders' => Opinion::$sortCriterias,
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/{page}", name="app_project_show_opinions", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/{opinionsSort}/{page}", name="app_project_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions|random"}, defaults={"page" = 1})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/{page}", name="app_consultation_show_opinions", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}/{opinionsSort}/{page}", name="app_consultation_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions|random"}, defaults={"page" = 1})
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("currentStep", class="CapcoAppBundle:Steps\ConsultationStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinionTypeSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_by_type.html.twig")
     */
    public function showByTypeAction(Project $project, ConsultationStep $currentStep, OpinionType $opinionType, $page, Request $request, $opinionsSort = null)
    {
        if (!$currentStep->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('project.error.not_found', [], 'CapcoAppBundle'));
        }

        $opinionTypesResolver = $this->get('capco.opinion_types.resolver');

        if (false == $opinionTypesResolver->stepAllowType($currentStep, $opinionType)) {
            throw $this->createNotFoundException('This type does not exist for this consultation step');
        }

        $filter = $opinionsSort ?: $opinionType->getDefaultFilter();
        $currentUrl = $this
            ->generateUrl('app_consultation_show_opinions', [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $currentStep->getSlug(),
                'opinionTypeSlug' => $opinionType->getSlug(),
                'page' => $page,
            ]);
        $opinions = $this->getDoctrine()
            ->getRepository('CapcoAppBundle:Opinion')
            ->getByOpinionTypeAndConsultationStepOrdered($currentStep, $opinionType->getId(), 10, $page, $filter);

        return [
            'currentUrl' => $currentUrl,
            'project' => $project,
            'opinionType' => $opinionType,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10),
            'opinionsSort' => $filter,
            'opinionSortOrders' => Opinion::$sortCriterias,
            'currentStep' => $currentStep,
            'currentRoute' => $request->get('_route'),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}", name="app_project_show_opinion_version")
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}", name="app_consultation_show_opinion_version")
     * @Template("CapcoAppBundle:Opinion:show_version.html.twig")
     */
    public function showOpinionVersionAction(Request $request, $projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $versionSlug)
    {
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlugJoinUserReports($opinionSlug, $this->getUser());
        $version = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVersion')->findOneBySlug($versionSlug);

        if (!$opinion || !$version || !$version->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle'));
        }

        $currentStep = $opinion->getStep();
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByOpinionJoinUserReports($opinion, $this->getUser());
        $backLink = $this->generateUrl('app_project_show_opinion', [
          'projectSlug' => $projectSlug,
          'stepSlug' => $stepSlug,
          'opinionTypeSlug' => $opinionTypeSlug,
          'opinionSlug' => $opinionSlug,
        ]);

        return [
            'version' => $version,
            'currentStep' => $currentStep,
            'project' => $currentStep->getProject(),
            'opinion' => $opinion,
            'backLink' => $backLink,
            'sources' => $sources,
            'opinionType' => $opinion->getOpinionType(),
            'votes' => $opinion->getVotes(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_project_show_opinion")
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_consultation_show_opinion")
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_project_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_consultation_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date"})
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     */
    public function showOpinionAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlugJoinUserReports($opinionSlug, $this->getUser());

        if (!$opinion || !$opinion->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle'));
        }

        $currentUrl = $this->generateUrl('app_project_show_opinion', ['projectSlug' => $projectSlug, 'stepSlug' => $stepSlug, 'opinionTypeSlug' => $opinionTypeSlug, 'opinionSlug' => $opinionSlug]);
        $currentStep = $opinion->getStep();

        $steps = $this->getDoctrine()->getRepository('CapcoAppBundle:Steps\AbstractStep')->getByProjectSlug($projectSlug);

        $urlResolver = $this->get('capco.url.resolver');
        $referer = $request->headers->get('referer');
        $availableRoutes = [
            'app_project_show_opinions',
            'app_project_show_opinions_sorted',
            'app_project_show_consultation',
            'app_consultation_show_opinions',
            'app_consultation_show_opinions_sorted'
        ];
        $baseUrl = $request->getHost();
        $pathinfos = substr($referer, strpos($referer, $baseUrl) + strlen($baseUrl));
        $backLink = $referer &&
          filter_var($referer, FILTER_VALIDATE_URL) !== false &&
          in_array($this->get('router')->match($pathinfos)['_route'], $availableRoutes, true)
            ? $referer
            : $urlResolver->getStepUrl($currentStep, UrlGenerator::ABSOLUTE_URL)
        ;

        return [
            'currentUrl' => $currentUrl,
            'currentStep' => $currentStep,
            'project' => $currentStep->getProject(),
            'opinion' => $opinion,
            'backLink' => $backLink,
            'opinionType' => $opinion->getOpinionType(),
            'project_steps' => $steps,
        ];
    }
}
