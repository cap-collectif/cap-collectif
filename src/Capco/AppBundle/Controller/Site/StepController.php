<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use JMS\Serializer\SerializationContext;

class StepController extends Controller
{
    /**
     * @Cache(smaxage="60", public=true)
     * @Route("/project/{projectSlug}/step/{stepSlug}", name="app_project_show_step")
     * @Route("/consultation/{projectSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\OtherStep", options={"mapping": {"stepSlug": "slug"}})
     *
     * @param string    $projectSlug
     * @param OtherStep $step
     *
     * @return array
     */
    public function showStepAction($projectSlug, OtherStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        return [
            'project' => $project,
            'currentStep' => $step,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/presentation/{stepSlug}", name="app_project_show_presentation")
     * @Route("/consultation/{projectSlug}/presentation/{stepSlug}", name="app_consultation_show_presentation")
     * @Template("CapcoAppBundle:Step:presentation.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\PresentationStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param PresentationStep $step
     *
     * @return array
     */
    public function showPresentationAction($projectSlug, PresentationStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }
        $events = $this->get('capco.event.resolver')->getLastByProject($projectSlug, 2);
        $posts = $this->get('capco.blog.post.repository')->getLastPublishedByProject($projectSlug, 2);
        $nbEvents = $this->get('capco.event.resolver')->countEvents(null, null, $projectSlug, null);
        $nbPosts = $em->getRepository('CapcoAppBundle:Post')->countSearchResults(null, $projectSlug);

        $contributors = $this->get('capco.contribution.resolver')->getProjectContributorsOrdered($project, true, 10, 1);

        $showVotes = $this->get('capco.project.helper')->hasStepWithVotes($project);

        return [
            'project' => $project,
            'currentStep' => $step,
            'events' => $events,
            'posts' => $posts,
            'nbEvents' => $nbEvents,
            'nbPosts' => $nbPosts,
            'contributors' => $contributors,
            'showVotes' => $showVotes,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}", name="app_project_show_ranking")
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}", name="app_consultation_show_ranking")
     * @Template("CapcoAppBundle:Step:ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param RankingStep $step
     *
     * @return array
     */
    public function showRankingAction($projectSlug, RankingStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $nbOpinionsToDisplay = $step->getNbOpinionsToDisplay() !== null ? $step->getNbOpinionsToDisplay() : 10;
        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByProject($project, $excludedAuthor, true, $nbOpinionsToDisplay)
        ;

        $nbVersionsToDisplay = $step->getNbVersionsToDisplay() !== null ? $step->getNbVersionsToDisplay() : 10;
        $versions = $em
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getEnabledByProject($project, $excludedAuthor, true, $nbVersionsToDisplay)
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'opinions' => $opinions,
            'nbOpinionsToDisplay' => $nbOpinionsToDisplay,
            'versions' => $versions,
            'nbVersionsToDisplay' => $nbVersionsToDisplay,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/opinions/{page}", name="app_project_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/opinions/{page}", name="app_consultation_show_opinions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:opinions_ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param RankingStep $step
     *
     * @return array
     */
    public function showOpinionsRankingAction($projectSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByProject($project, $excludedAuthor, true, 10, $page)
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_project_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultation/{projectSlug}/ranking/{stepSlug}/versions/{page}", name="app_consultation_show_versions_ranking", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Template("CapcoAppBundle:Step:versions_ranking.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\RankingStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param RankingStep $step
     * @param $page
     *
     * @return array
     */
    public function showVersionsRankingAction($projectSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $versions = $em
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getEnabledByProject($project, $excludedAuthor, true, 10, $page)
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'versions' => $versions,
            'page' => $page,
            'nbPage' => ceil(count($versions) / 10),
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}", name="app_project_show_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}", name="app_consultation_show_synthesis")
     * @Template("CapcoAppBundle:Step:synthesis.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param SynthesisStep $step
     *
     * @return array
     */
    public function showSynthesisAction($projectSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $serializer = $this->get('jms_serializer');

        $props = $serializer->serialize([
            'synthesis_id' => $step->getSynthesis()->getId(),
            'mode' => 'view',
        ], 'json', SerializationContext::create());

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}", name="app_project_show_collect")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\CollectStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param Project     $project
     * @param CollectStep $step
     *
     * @return Response
     */
    public function showCollectStepAction(Project $project, CollectStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');

        $searchResults = $this
            ->get('capco.search.resolver')
            ->searchProposals(1, 50, null, null, ['proposalForm' => $step->getProposalForm()->getId()])
        ;

        $props = $serializer->serialize([
            'statuses' => $step->getStatuses(),
            'form' => $step->getProposalForm(),
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
            'districts' => $em->getRepository('CapcoAppBundle:District')->findAll(),
            'types' => $em->getRepository('CapcoUserBundle:UserType')->findAll(),
            'step' => $step,
            'count' => $searchResults['count'],
            'proposals' => $searchResults['proposals'],
        ], 'json', SerializationContext::create()->setGroups(['Statuses', 'ProposalForms', 'Questions', 'Themes', 'Districts', 'Default', 'Steps', 'UserVotes', 'Proposals', 'UsersInfos', 'UserMedias']));

        $response = $this->render('CapcoAppBundle:Step:collect.html.twig', [
            'project' => $project,
            'currentStep' => $step,
            'proposalsCount' => $searchResults['count'],
            'props' => $props,
        ]);

        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_ANONYMOUSLY')) {
            $response->setPublic();
            $response->setSharedMaxAge(60);
        }

        return $response;
    }

    /**
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}", name="app_project_show_questionnaire")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\QuestionnaireStep", options={"mapping" = {"stepSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @Cache(smaxage="60", public=true)
     *
     * @param Project           $project
     * @param QuestionnaireStep $step
     *
     * @return Response
     */
    public function showQuestionnaireStepAction(Project $project, QuestionnaireStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        if (!$step->getQuestionnaire()) {
            return $this->render('CapcoAppBundle:Step:questionnaire.html.twig', [
                'project' => $project,
                'currentStep' => $step,
            ]);
        }

        foreach ($step->getQuestionnaire()->getRealQuestions() as $question) {
            if ($question instanceof MultipleChoiceQuestion) {
                if ($question->isRandomQuestionChoices()) {
                    $choices = $question->getQuestionChoices()->toArray();
                    shuffle($choices);
                    $question->setQuestionChoices($choices);
                }
            }
        }

        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');

        $userRepliesRaw = [];
        if ($this->getUser()) {
            $userRepliesRaw = $em
                ->getRepository('CapcoAppBundle:Reply')
                ->findBy(
                    [
                        'questionnaire' => $step->getQuestionnaire(),
                        'author' => $this->getUser(),
                    ]
                )
            ;
        }

        $props = $serializer->serialize([
            'step' => $step,
            'form' => $step->getQuestionnaire() ? $step->getQuestionnaire() : null,
            'userReplies' => $userRepliesRaw,
        ], 'json', SerializationContext::create()
            ->setGroups(['Questionnaires', 'Questions', 'Steps', 'UserVotes', 'Replies', 'UsersInfos', 'UserMedias']))
        ;

        $response = $this->render('CapcoAppBundle:Step:questionnaire.html.twig', [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ]);

        return $response;
    }

    /**
     * @Route("/project/{projectSlug}/selection/{stepSlug}", name="app_project_show_selection")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\SelectionStep", options={"mapping" = {"stepSlug": "slug"}})
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Step:selection.html.twig")
     */
    public function showSelectionStepAction(Project $project, SelectionStep $step)
    {
        if (!$step->canDisplay()) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');

        $searchResults = $this
            ->get('capco.search.resolver')
            ->searchProposals(1, 50, $step->getDefaultSort(), null, ['selectionStep' => $step->getId()])
        ;

        $user = $this->getUser();

        if ($user) {
            $searchResults['proposals'] = $this
                ->get('capco.proposal_votes.resolver')
                ->addVotesToProposalsForSelectionStepAndUser(
                    $searchResults['proposals'],
                    $step,
                    $user
                )
            ;
        }

        $props = $serializer->serialize([
            'step' => $step,
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
            'statuses' => $em->getRepository('CapcoAppBundle:Status')->getByProject($project),
            'districts' => $em->getRepository('CapcoAppBundle:District')->findAll(),
            'types' => $em->getRepository('CapcoUserBundle:UserType')->findAll(),
            'proposals' => $searchResults['proposals'],
            'count' => $searchResults['count'],
        ], 'json', SerializationContext::create()->setGroups(['Steps', 'UserVotes', 'Statuses', 'Themes', 'Districts', 'Default', 'Proposals', 'UsersInfos', 'UserMedias']));

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/synthesis/{stepSlug}/edition", name="app_project_edit_synthesis")
     * @Route("/consultation/{projectSlug}/synthesis/{stepSlug}/edition", name="app_consultation_edit_synthesis")
     * @Template("CapcoAppBundle:Synthesis:main.html.twig")
     * @ParamConverter("step", class="CapcoAppBundle:Steps\SynthesisStep", options={"mapping" = {"stepSlug": "slug"}})
     *
     * @param $projectSlug
     * @param SynthesisStep $step
     *
     * @return array
     */
    public function editSynthesisAction($projectSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay() || !$step->getSynthesis()) {
            throw new NotFoundHttpException();
        }

        if (!$step->getSynthesis()->isEditable() || !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw new NotFoundHttpException();
        }

        $serializer = $this->get('jms_serializer');

        $props = $serializer->serialize([
            'synthesis_id' => $step->getSynthesis()->getId(),
            'mode' => 'edit',
        ], 'json', SerializationContext::create());

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}", name="app_project_show")
     * @Route("/project/{projectSlug}/consultation/{stepSlug}", name="app_project_show_consultation")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}, "repository_method"="getOne"})
     * @ParamConverter("currentStep", class="CapcoAppBundle:Steps\ConsultationStep", options={"mapping": {"stepSlug": "slug"}, "method"="getOne"})
     *
     * @param Request          $request
     * @param Project          $project
     * @param ConsultationStep $currentStep
     *
     * @return array
     */
    public function showConsultationAction(Request $request, Project $project, ConsultationStep $currentStep)
    {
        $serializer = $this->get('jms_serializer');

        if (false === $currentStep->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('project.error.not_found', [], 'CapcoAppBundle'));
        }

        $nav = $this->get('capco.opinion_types.resolver')->getNavForStep($currentStep);

        $stepProps = $serializer->serialize([
            'step' => $currentStep,
        ], 'json', SerializationContext::create()->setGroups(['Steps', 'UserVotes']));

        $response = $this->render('CapcoAppBundle:Consultation:show.html.twig', [
            'project' => $project,
            'currentStep' => $currentStep,
            'stepProps' => $stepProps,
            'nav' => $nav,
        ]);

        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_ANONYMOUSLY')) {
            $response->setPublic();
            $response->setSharedMaxAge(30);
        }

        return $response;
    }
}
