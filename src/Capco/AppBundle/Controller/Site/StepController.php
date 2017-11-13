<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class StepController extends Controller
{
    /**
     * @Route("/project/{projectSlug}/step/{stepSlug}", name="app_project_show_step")
     * @Route("/consultation/{projectSlug}/step/{stepSlug}", name="app_consultation_show_step")
     * @Template("CapcoAppBundle:Step:show.html.twig")
     * @Cache(smaxage="60", public=true)
     * @ParamConverter("step", class="CapcoAppBundle:Steps\OtherStep", options={"mapping": {"stepSlug": "slug"}})
     */
    public function showStepAction(string $projectSlug, OtherStep $step)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);

        if (!$project) {
            throw $this->createNotFoundException();
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
     * @Cache(smaxage="60", public=true)
     */
    public function showPresentationAction(string $projectSlug, PresentationStep $step)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw $this->createNotFoundException();
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
     * @Cache(smaxage="60", public=true)
     */
    public function showRankingAction(string $projectSlug, RankingStep $step)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw $this->createNotFoundException();
        }

        $excludedAuthor = !$project->getIncludeAuthorInRanking() ? $project->getAuthor()->getId() : null;

        $nbOpinionsToDisplay = null !== $step->getNbOpinionsToDisplay() ? $step->getNbOpinionsToDisplay() : 10;
        $opinions = $em
            ->getRepository('CapcoAppBundle:Opinion')
            ->getEnabledByProject($project, $excludedAuthor, true, $nbOpinionsToDisplay)
        ;

        $nbVersionsToDisplay = null !== $step->getNbVersionsToDisplay() ? $step->getNbVersionsToDisplay() : 10;
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
     * @Cache(smaxage="60", public=true)
     *
     * @param mixed $page
     */
    public function showOpinionsRankingAction(string $projectSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw $this->createNotFoundException();
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
     * @Cache(smaxage="60", public=true)
     *
     * @param mixed $page
     */
    public function showVersionsRankingAction(string $projectSlug, RankingStep $step, $page = 1)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw $this->createNotFoundException();
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
     * @Cache(smaxage="60", public=true)
     */
    public function showSynthesisAction(string $projectSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw $this->createNotFoundException();
        }

        $serializer = $this->get('serializer');

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
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Step:collect.html.twig")
     */
    public function showCollectStepAction(Project $project, CollectStep $step)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('serializer');

        $proposalForm = $step->getProposalForm();
        $searchResults = ['proposals' => [], 'count' => 0];

        if ($proposalForm) {
            $filters = ['proposalForm' => $proposalForm->getId()];

            if ($step->isPrivate() && $this->getUser()) {
                $filters['authorUniqueId'] = $this->getUser()->getUniqueIdentifier();
                $searchResults = $this->get('capco.search.proposal_search')
                    ->searchProposals(1, 51, null, null, $filters);
            } else {
                $searchResults = $this->get('capco.search.proposal_search')
                    ->searchProposals(1, 51, null, null, $filters);
            }
        }

        $countFusions = $em
          ->getRepository('CapcoAppBundle:Proposal')
          ->countFusionsByProposalForm($proposalForm)
        ;

        $props = $serializer->serialize([
            'statuses' => $step->getStatuses(),
            'form' => $proposalForm,
            'categories' => $proposalForm ? $proposalForm->getCategories() : [],
            'stepId' => $step->getId(),
            'defaultSort' => $step->getDefaultSort() ?: null,
            'count' => $searchResults['count'],
            'countFusions' => $countFusions,
        ], 'json', SerializationContext::create()->setGroups(['Statuses', 'ProposalForms', 'Questions', 'ThemeDetails', 'Districts', 'DistrictDetails', 'Default', 'Steps', 'VoteThreshold', 'UserVotes', 'Proposals', 'UsersInfos', 'UserMedias']));

        return [
            'project' => $project,
            'currentStep' => $step,
            'proposalsCount' => $searchResults['count'],
            'props' => $props,
        ];
    }

    /**
     * @Route("/project/{projectSlug}/questionnaire/{stepSlug}", name="app_project_show_questionnaire")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\QuestionnaireStep", options={"mapping" = {"stepSlug": "slug"}, "repository_method"= "getOne", "map_method_signature" = true})
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Step:questionnaire.html.twig")
     */
    public function showQuestionnaireStepAction(Project $project, QuestionnaireStep $step)
    {
        if (!$step->canDisplay()) {
            throw $this->createNotFoundException();
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
        $serializer = $this->get('serializer');

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
            'form' => $step->getQuestionnaire() ?: null,
            'userReplies' => $userRepliesRaw,
        ], 'json', SerializationContext::create()
            ->setGroups(['Questionnaires', 'Questions', 'QuestionnaireSteps', 'Steps', 'UserVotes', 'Replies', 'UsersInfos', 'UserMedias']))
        ;

        return [
            'project' => $project,
            'currentStep' => $step,
            'props' => $props,
        ];
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
            throw $this->createNotFoundException();
        }

        $serializer = $this->get('serializer');

        $searchResults = $this
            ->get('capco.search.proposal_search')
            ->searchProposals(
                1,
                51,
                $step->getDefaultSort(),
                null,
                ['selectionStep' => $step->canShowProposals() ? $step->getId() : 0]
            );

        $form = $step->getProposalForm();
        $showThemes = $form->isUsingThemes();
        $categories = $form->getCategories();

        $props = $serializer->serialize([
            'stepId' => $step->getId(),
            'statuses' => $step->getStatuses(),
            'categories' => $categories,
            'proposals' => $searchResults['proposals'],
            'count' => $searchResults['count'],
            'defaultSort' => $step->getDefaultSort() ?: null,
            'form' => $form,
            'showThemes' => $showThemes,
        ], 'json', SerializationContext::create()->setGroups(['Steps', 'ProposalForms', 'UserVotes', 'Statuses', 'ThemeDetails', 'Districts', 'Default', 'Proposals', 'UsersInfos', 'UserMedias', 'VoteThreshold']));

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
     * @param mixed $projectSlug
     */
    public function editSynthesisAction($projectSlug, SynthesisStep $step)
    {
        if (!$step->canDisplay() || !$step->getSynthesis()) {
            throw $this->createNotFoundException();
        }

        if (!$step->getSynthesis()->isEditable() || !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('CapcoAppBundle:Project')->getOne($projectSlug);
        if (!$project) {
            throw $this->createNotFoundException();
        }

        $serializer = $this->get('serializer');

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
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={
     *    "mapping": {"projectSlug": "slug"},
     *    "repository_method"="findOneBySlug"
     * })
     * @ParamConverter("currentStep", class="CapcoAppBundle:Steps\ConsultationStep", options={
     *    "mapping": {"stepSlug": "slug"},
     *    "method"="getOne",
     *    "map_method_signature"=true
     * })
     * @Cache(smaxage=60, public=true)
     * @Template("CapcoAppBundle:Consultation:show.html.twig")
     */
    public function showConsultationAction(Project $project, ConsultationStep $currentStep)
    {
        $serializer = $this->get('serializer');

        if (!$currentStep->canDisplay()) {
            $error = $this->get('translator')->trans('project.error.not_found', [], 'CapcoAppBundle');
            throw $this->createNotFoundException($error);
        }

        $stepProps = $serializer->serialize([
            'step' => $currentStep,
        ], 'json', SerializationContext::create()->setGroups(['ConsultationSteps', 'Steps', 'UserVotes']));

        return [
            'project' => $project,
            'currentStep' => $currentStep,
            'stepProps' => $stepProps,
        ];
    }
}
