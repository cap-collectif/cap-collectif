<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionAppendix;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class OpinionController extends Controller
{
    /**
     * @Template("CapcoAppBundle:Consultation:show_opinions.html.twig")
     *
     * @param $project
     * @param $currentStep
     *
     * @return array
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
     *
     * @param Project          $project
     * @param ConsultationStep $currentStep
     * @param OpinionType      $opinionType
     * @param $page
     * @param Request $request
     * @param $opinionsSort
     *
     * @return array
     */
    public function showByTypeAction(Project $project, ConsultationStep $currentStep, OpinionType $opinionType, $page, Request $request, $opinionsSort = null)
    {
        if (false == $currentStep->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('project.error.not_found', [], 'CapcoAppBundle'));
        }

        $opinionTypesResolver = $this->get('capco.opinion_types.resolver');

        if (false == $opinionTypesResolver->stepAllowType($currentStep, $opinionType)) {
            throw new NotFoundHttpException('This type does not exist for this consultation step');
        }

        $filter = $opinionsSort ? $opinionsSort : $opinionType->getDefaultFilter();
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
        $nav = $this->get('capco.opinion_types.resolver')
            ->getNavForStep($currentStep);

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
            'nav' => $nav,
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

        $steps = $this->getDoctrine()->getRepository('CapcoAppBundle:Steps\AbstractStep')->getByProject($projectSlug);

        $nav = $this->get('capco.opinion_types.resolver')->getNavForStep($currentStep);

        return [
            'version' => $version,
            'currentStep' => $currentStep,
            'project' => $currentStep->getProject(),
            'opinion' => $opinion,
            'sources' => $sources,
            'opinionType' => $opinion->getOpinionType(),
            'votes' => $opinion->getVotes(),
            'nav' => $nav,
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/delete", name="app_project_delete_opinion")
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/delete", name="app_consultation_delete_opinion")
     *
     * @param $projectSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $projectSlug
     * @param $opinionSlug
     * @param $request
     * @Template("CapcoAppBundle:Opinion:delete.html.twig")
     *
     * @return array
     */
    public function deleteOpinionAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.not_author', [], 'CapcoAppBundle'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('opinion.delete.success'));

                return $this->redirect($this->generateUrl('app_project_show_consultation', ['projectSlug' => $project->getSlug(), 'stepSlug' => $currentStep->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.delete.error'));
            }
        }

        return [
            'opinion' => $opinion,
            'project' => $project,
            'currentStep' => $currentStep,
            'opinionType' => $opinionType,
            'form' => $form->createView(),
        ];
    }

    /**
     * Page opinion.
     *
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_project_show_opinion")
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_consultation_show_opinion")
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_project_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_consultation_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date"})
     *
     * @param $projectSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param Request $request
     *
     * @return array
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

        $steps = $this->getDoctrine()->getRepository('CapcoAppBundle:Steps\AbstractStep')->getByProject($projectSlug);

        $nav = $this->get('capco.opinion_types.resolver')->getNavForStep($currentStep);

        return [
            'currentUrl' => $currentUrl,
            'currentStep' => $currentStep,
            'project' => $currentStep->getProject(),
            'opinion' => $opinion,
            'opinionType' => $opinion->getOpinionType(),
            'project_steps' => $steps,
            'nav' => $nav,
        ];
    }

    // TODO fix this ugly stuff
    private function createAppendicesForOpinion(Opinion $opinion)
    {
        $appendixTypes = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionTypeAppendixType')
            ->findBy(
                ['opinionType' => $opinion->getOpinionType()],
                ['position' => 'ASC']
            );
        foreach ($appendixTypes as $otat) {
            $app = new OpinionAppendix();
            $app->setAppendixType($otat->getAppendixType());
            $app->setOpinion($opinion);
            $opinion->addAppendice($app);
        }

        return $opinion;
    }
}
