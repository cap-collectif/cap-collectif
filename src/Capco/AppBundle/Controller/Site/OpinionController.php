<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class OpinionController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}", name="app_project_show_opinions", requirements={"opinionTypeSlug" = ".+"})
     * @Route("/project/{projectSlug}/consultation/{stepSlug}/types/{opinionTypeSlug}", name="app_project_show_opinions_2", requirements={"opinionTypeSlug" = ".+"})
     *
     * Legacy URLs :
     *
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
     * @Template("CapcoAppBundle:Consultation:SectionPage.html.twig")
     */
    public function sectionPageAction(
        Project $project,
        string $opinionTypeSlug,
        ConsultationStep $step
    ) {
        if (!$step->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        $opinionTypesResolver = $this->get(OpinionTypesResolver::class);
        $opinionType = $opinionTypesResolver->findByStepAndSlug($step, $opinionTypeSlug);

        return [
            'project' => $project,
            'navigationStepProps' => [
                'id' => GlobalId::toGlobalId('ConsultationStep', $step->getId()),
                'consultationSlug' => $opinionType->getConsultation()->getSlug()
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
    ) {
        if (!$version->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'version' => $version,
            'opinion' => $opinion,
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
    ) {
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
