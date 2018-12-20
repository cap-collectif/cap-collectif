<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Form\Api\SynthesisElementType as SynthesisElementForm;
use Capco\AppBundle\Form\Api\SynthesisType as SynthesisForm;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

class SynthesisController extends FOSRestController
{
    /**
     * Get syntheses.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\Synthesis[]
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all the syntheses",
     *  output="Capco\AppBundle\Entity\Synthesis\Synthesis",
     *  statusCodes={
     *    200 = "Syntheses found",
     *    404 = "No syntheses",
     *  }
     * )
     * @Security("has_role('ROLE_ADMIN')")
     * @Get("/syntheses")
     * @View(serializerGroups={"Syntheses", "Elements"})
     */
    public function getSynthesesAction()
    {
        return $this->get('capco.synthesis.synthesis_handler')->getAllSyntheses();
    }

    /**
     * Create a synthesis from submitted data.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create a synthesis",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    400 = "Returned when creation fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Post("/syntheses")
     * @View(statusCode=201, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function createSynthesisAction(Request $request)
    {
        $synthesis = new Synthesis();
        $form = $this->createForm(SynthesisForm::class, $synthesis);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $synthesis = $this->get('capco.synthesis.synthesis_handler')->createSynthesis($synthesis);

        return $synthesis;
    }

    /**
     * Create a synthesis from submitted data and consultation step.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create a synthesis from a consultation step",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    400 = "Returned when creation fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Post("/syntheses/from-consultation-step/{id}")
     * @ParamConverter("consultationStep", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function createSynthesisFromConsultationStepAction(
        Request $request,
        ConsultationStep $consultationStep
    ) {
        $synthesis = new Synthesis();
        $form = $this->createForm(SynthesisForm::class, $synthesis);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $synthesis = $this->get(
            'capco.synthesis.synthesis_handler'
        )->createSynthesisFromConsultationStep($synthesis, $consultationStep);

        return $synthesis;
    }

    /**
     * Get a synthesis by id.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get a synthesis with all elements",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Synthesis does not exist",
     *  }
     * )
     *
     * @Get("/syntheses/{id}", name="get_synthesis")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
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
     * @ApiDoc(
     *  resource=true,
     *  description="Update a synthesis",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    400 = "Returned when update fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Put("/syntheses/{id}")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function updateSynthesisAction(Request $request, Synthesis $synthesis)
    {
        $form = $this->createForm(SynthesisForm::class, $synthesis);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $synthesis = $this->get('capco.synthesis.synthesis_handler')->updateSynthesis(
                $synthesis
            );

            return $synthesis;
        }

        return $form;
    }

    /**
     * Get updated synthesis by id.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get updated synthesis with all elements",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Synthesis does not exist",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Get("/syntheses/{id}/updated")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
     *
     * @param mixed $id
     */
    public function getUpdatedSynthesisAction($id)
    {
        return $this->get('capco.synthesis.synthesis_handler')->getUpdatedSynthesis($id);
    }

    /**
     * Get synthesis elements filtered by type.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get the elements of a synthesis, filtered by type",
     *  statusCodes={
     *    200 = "Syntheses element found",
     *    404 = "Synthesis not found",
     *  }
     * )
     *
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
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

        return $this->get(
            'capco.synthesis.synthesis_element_handler'
        )->getElementsFromSynthesisByType($synthesis, $type, $term, $offset, $limit);
    }

    /**
     * Get synthesis elements tree.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get the tree of elements of a synthesis",
     *  statusCodes={
     *    200 = "Syntheses element found",
     *    404 = "Synthesis not found",
     *  }
     * )
     *
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
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

        $tree = $this->get(
            'capco.synthesis.synthesis_element_handler'
        )->getElementsTreeFromSynthesisByType($synthesis, $type, $parent);

        return $tree;
    }

    /**
     * Count synthesis elements filtered by type.
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Count the elements of a synthesis, filtered by type",
     *  statusCodes={
     *    200 = "Success",
     *     404 = "Synthesis not found",
     *  }
     * )
     *
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
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
            throw new AccessDeniedException();
        }

        return [
            'count' => $this->get(
                'capco.synthesis.synthesis_element_handler'
            )->countElementsFromSynthesisByType($synthesis, $type),
        ];
    }

    /**
     * Get a synthesis element by id.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get the synthesis element",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Synthesis element does not exist",
     *  }
     * )
     *
     * @Get("/syntheses/{synthesis_id}/elements/{element_id}", name="get_synthesis_element")
     * @ParamConverter("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("element", options={"mapping": {"element_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function getSynthesisElementAction(Synthesis $synthesis, SynthesisElement $element)
    {
        if (
            (!$synthesis->isEnabled() || !$element->isPublished()) &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            throw new AccessDeniedException();
        }

        return $element;
    }

    /**
     * Create a synthesis element.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create a synthesis element",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    400 = "Returned when creation fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Post("/syntheses/{id}/elements")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode="201", serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function createSynthesisElementAction(Request $request, Synthesis $synthesis)
    {
        $element = new SynthesisElement();
        $form = $this->createForm(SynthesisElementForm::class, $element, ['hasDivision' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            throw new BadRequestHttpException($form->getErrors(true));
        }

        $element = $this->get(
            'capco.synthesis.synthesis_element_handler'
        )->createElementInSynthesis($element, $synthesis, $this->getUser());

        return $element;
    }

    /**
     * Update a synthesis element.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Update a synthesis element",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    400 = "Returned when update fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Put("/syntheses/{synthesisId}/elements/{elementId}")
     * @ParamConverter("synthesis", options={"mapping": {"synthesisId": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("element", options={"mapping": {"elementId": "id"}})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function updateSynthesisElementAction(
        Request $request,
        Synthesis $synthesis,
        SynthesisElement $element
    ) {
        $form = $this->createForm(SynthesisElementForm::class, $element, ['hasDivision' => true]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            throw new BadRequestHttpException($form->getErrors(true));
        }

        $element = $this->get(
            'capco.synthesis.synthesis_element_handler'
        )->updateElementInSynthesis($element, $synthesis);

        return $element;
    }

    /**
     * Get history of a synthesis element.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get history of a synthesis element",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when element is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Get("/syntheses/{synthesis_id}/elements/{element_id}/history", name="get_synthesis_element_history")
     * @ParamConverter("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("element", options={"mapping": {"element_id": "id"}})
     * @View(serializerGroups={"Elements", "LogDetails"})
     */
    public function getSynthesisElementHistoryAction(
        Request $request,
        Synthesis $synthesis,
        SynthesisElement $element
    ) {
        $logs = $this->get('capco.synthesis.synthesis_element_handler')->getLogsForElement(
            $element
        );

        return $logs;
    }

    /**
     * Update synthesis display rules.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Update synthesis display rules",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when synthesis is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Put("/syntheses/{synthesis_id}/display")
     * @ParamConverter("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerGroups={"Syntheses", "Elements"})
     */
    public function updateSynthesisDisplayRulesAction(Request $request, Synthesis $synthesis)
    {
        $synthesis->setDisplayRules($request->request->get('rules'));
        $this->getDoctrine()
            ->getManager()
            ->flush();

        return $synthesis;
    }
}
