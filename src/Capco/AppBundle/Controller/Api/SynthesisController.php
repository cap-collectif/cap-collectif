<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Synthesis\Handler\SynthesisElementHandler;
use Capco\AppBundle\Synthesis\Handler\SynthesisHandler;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Form\Api\SynthesisType as SynthesisForm;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Capco\AppBundle\Form\Api\SynthesisElementType as SynthesisElementForm;

class SynthesisController extends AbstractFOSRestController
{
    /**
     * Get syntheses.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\Synthesis[]
     *
     * @Get("/syntheses")
     * @View(serializerGroups={"Syntheses", "Elements"})
     */
    public function getSynthesesAction()
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        return $this->get(SynthesisHandler::class)->getAllSyntheses();
    }

    /**
     * Create a synthesis from submitted data.
     *
     * @Post("/syntheses")
     * @View(statusCode=201, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function createSynthesisAction(Request $request)
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $synthesis = new Synthesis();
        $form = $this->createForm(SynthesisForm::class, $synthesis);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        return $this->get(SynthesisHandler::class)->createSynthesis($synthesis);
    }

    /**
     * Create a synthesis from submitted data and consultation step.
     *
     *
     * @Post("/syntheses/from-consultation-step/{id}")
     * @Entity("consultationStep", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function createSynthesisFromConsultationStepAction(
        Request $request,
        ConsultationStep $consultationStep
    ) {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }
        $synthesis = new Synthesis();
        $form = $this->createForm(SynthesisForm::class, $synthesis);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        return $this->get(SynthesisHandler::class)->createSynthesisFromConsultationStep(
            $synthesis,
            $consultationStep
        );
    }

    /**
     * Get a synthesis by id.
     *
     * @Get("/syntheses/{id}", name="get_synthesis")
     * @Entity("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function getSynthesisAction(Synthesis $synthesis)
    {
        if (
            !$synthesis->isEnabled() &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new AccessDeniedException();
        }

        return $synthesis;
    }

    /**
     * Update a synthesis.
     *
     * @Put("/syntheses/{id}")
     * @Entity("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function updateSynthesisAction(Request $request, Synthesis $synthesis)
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $form = $this->createForm(SynthesisForm::class, $synthesis);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            return $this->get(SynthesisHandler::class)->updateSynthesis($synthesis);
        }

        return $form;
    }

    /**
     * Get updated synthesis by id.
     *
     * @Get("/syntheses/{id}/updated")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
     *
     * @param mixed $id
     */
    public function getUpdatedSynthesisAction($id)
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        return $this->get(SynthesisHandler::class)->getUpdatedSynthesis($id);
    }

    /**
     * Get synthesis elements filtered by type.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     * @Entity("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @QueryParam(name="term", nullable=true)
     * @QueryParam(name="type", nullable=true)
     * @QueryParam(name="offset", nullable=true)
     * @QueryParam(name="limit", nullable=true)
     * @Get("/syntheses/{id}/elements", name="get_synthesis_elements")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementsList", "UserDetails"})
     */
    public function getSynthesisElementsAction(
        ParamFetcherInterface $paramFetcher,
        Synthesis $synthesis
    ) {
        $type = $paramFetcher->get('type');
        $term = $paramFetcher->get('term');
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');

        if (
            ('published' !== $type || !$synthesis->isEnabled()) &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new AccessDeniedException();
        }

        return $this->get(SynthesisElementHandler::class)->getElementsFromSynthesisByType(
            $synthesis,
            $type,
            $term,
            $offset,
            $limit
        );
    }

    /**
     * Get synthesis elements tree.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     *
     * @Entity("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @QueryParam(name="type", nullable=true, default="published")
     * @QueryParam(name="parent", nullable=true, default=null)
     * @Get("/syntheses/{id}/elements/tree")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementsTree"})
     */
    public function getSynthesisElementsTreeAction(
        ParamFetcherInterface $paramFetcher,
        Synthesis $synthesis
    ) {
        $type = $paramFetcher->get('type');
        $parent = $paramFetcher->get('parent');

        $isVisibleOnlyByAdmin = 'published' !== $type || !$synthesis->isEnabled();
        if (
            $isVisibleOnlyByAdmin &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            $this->createAccessDeniedException();
        }

        return $this->get(SynthesisElementHandler::class)->getElementsTreeFromSynthesisByType(
            $synthesis,
            $type,
            $parent
        );
    }

    /**
     * Count synthesis elements filtered by type.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     * @Entity("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @QueryParam(name="type", nullable=true)
     * @Get("/syntheses/{id}/elements/count")
     * @View()
     */
    public function countSynthesisElementsAction(
        ParamFetcherInterface $paramFetcher,
        Synthesis $synthesis
    ) {
        $type = $paramFetcher->get('type');
        if (
            ('published' !== $type || !$synthesis->isEnabled()) &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        return [
            'count' => $this->get(SynthesisElementHandler::class)->countElementsFromSynthesisByType(
                $synthesis,
                $type
            )
        ];
    }

    /**
     * Get a synthesis element by id.
     *
     * @Get("/syntheses/{synthesis_id}/elements/{element_id}", name="get_synthesis_element")
     * @Entity("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @Entity("element", options={"mapping": {"element_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function getSynthesisElementAction(Synthesis $synthesis, SynthesisElement $element)
    {
        if (
            (!$synthesis->isEnabled() || !$element->isPublished()) &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        return $element;
    }

    /**
     * Create a synthesis element.
     *
     * @Post("/syntheses/{id}/elements")
     * @Entity("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode="201", serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function createSynthesisElementAction(Request $request, Synthesis $synthesis)
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $element = new SynthesisElement();
        $form = $this->createForm(SynthesisElementForm::class, $element, ['hasDivision' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            throw new BadRequestHttpException($form->getErrors(true));
        }

        return $this->get(SynthesisElementHandler::class)->createElementInSynthesis(
            $element,
            $synthesis,
            $this->getUser()
        );
    }

    /**
     * Update a synthesis element.
     *
     * @Put("/syntheses/{synthesisId}/elements/{elementId}")
     * @Entity("synthesis", options={"mapping": {"synthesisId": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @Entity("element", options={"mapping": {"elementId": "id"}})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function updateSynthesisElementAction(
        Request $request,
        Synthesis $synthesis,
        SynthesisElement $element
    ) {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $form = $this->createForm(SynthesisElementForm::class, $element, ['hasDivision' => true]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            throw new BadRequestHttpException($form->getErrors(true));
        }

        return $this->get(SynthesisElementHandler::class)->updateElementInSynthesis(
            $element,
            $synthesis
        );
    }

    /**
     * Get history of a synthesis element.
     *
     * @Get("/syntheses/{synthesis_id}/elements/{element_id}/history", name="get_synthesis_element_history")
     * @Entity("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @Entity("element", options={"mapping": {"element_id": "id"}})
     * @View(serializerGroups={"Elements", "LogDetails"})
     */
    public function getSynthesisElementHistoryAction(
        Request $request,
        Synthesis $synthesis,
        SynthesisElement $element
    ) {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        return $this->get(SynthesisElementHandler::class)->getLogsForElement($element);
    }

    /**
     * Update synthesis display rules.
     *
     * @Put("/syntheses/{synthesis_id}/display")
     * @Entity("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerGroups={"Syntheses", "Elements"})
     */
    public function updateSynthesisDisplayRulesAction(Request $request, Synthesis $synthesis)
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $synthesis->setDisplayRules($request->request->get('rules'));
        $this->getDoctrine()
            ->getManager()
            ->flush();

        return $synthesis;
    }
}
