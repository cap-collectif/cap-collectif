<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Util\Codes;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use JMS\Serializer\SerializationContext;
use Capco\AppBundle\Form\Api\SynthesisType as SynthesisForm;
use Capco\AppBundle\Form\Api\SynthesisElementType as SynthesisElementForm;

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
     *
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
     */
    public function createSynthesisAction(Request $request)
    {
        $synthesis = new Synthesis();
        $form = $this->createForm(new SynthesisForm(), $synthesis);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $synthesis = $this->get('capco.synthesis.synthesis_handler')->createSynthesis($synthesis);
            $view = $this->view($synthesis, Codes::HTTP_CREATED);
            $view->setSerializationContext(SerializationContext::create()->setGroups(array('SynthesisDetails', 'Elements')));
            $url = $this->generateUrl('get_synthesis', ['id' => $synthesis->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
            $view->setHeader('Location', $url);

            return $view;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
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
     *
     * @param Request          $request
     * @param ConsultationStep $consultationStep
     *
     * @return \FOS\RestBundle\View\View
     */
    public function createSynthesisFromConsultationStepAction(Request $request, ConsultationStep $consultationStep)
    {
        $synthesis = new Synthesis();
        $form = $this->createForm(new SynthesisForm(), $synthesis);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $synthesis = $this->get('capco.synthesis.synthesis_handler')->createSynthesisFromConsultationStep($synthesis, $consultationStep);
            $view = $this->view($synthesis, Codes::HTTP_CREATED);
            $view->setSerializationContext(SerializationContext::create()->setGroups(array('SynthesisDetails', 'Elements')));
            $url = $this->generateUrl('get_synthesis', ['id' => $synthesis->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
            $view->setHeader('Location', $url);

            return $view;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
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
     * @Get("/syntheses/{id}")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
     */
    public function getSynthesisAction(Synthesis $synthesis)
    {
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
        $form = $this->createForm(new SynthesisForm(), $synthesis);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $synthesis = $this->get('capco.synthesis.synthesis_handler')->updateSynthesis($synthesis);

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
     * @Get("/syntheses/{id}/updated")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"SynthesisDetails", "Elements"})
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
     * @Security("has_role('ROLE_ADMIN')")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @QueryParam(name="type", nullable=true)
     * @QueryParam(name="offset", nullable=true)
     * @QueryParam(name="limit", nullable=true)
     * @Get("/syntheses/{id}/elements")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementsList", "UserDetails"})
     */
    public function getSynthesisElementsAction(ParamFetcherInterface $paramFetcher, Synthesis $synthesis)
    {
        $type = $paramFetcher->get('type');
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');

        return $this->get('capco.synthesis.synthesis_element_handler')->getElementsFromSynthesisByType($synthesis, $type, $offset, $limit);
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
     * @QueryParam(name="depth", nullable=true, default=3)
     * @QueryParam(name="parent", nullable=true, default=null)
     * @Get("/syntheses/{id}/elements/tree")
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementsTree"})
     */
    public function getSynthesisElementsTreeAction(ParamFetcherInterface $paramFetcher, Synthesis $synthesis)
    {
        $type = $paramFetcher->get('type');
        $depth = $paramFetcher->get('depth');
        $parent = $paramFetcher->get('parent');

        if ($type !== 'published' && !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $tree = $this->get('capco.synthesis.synthesis_element_handler')->getElementsTreeFromSynthesisByType($synthesis, $type, $parent, $depth);

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
    public function countSynthesisElementsAction(ParamFetcherInterface $paramFetcher, Synthesis $synthesis)
    {
        $type = $paramFetcher->get('type');
        if ($type !== 'published' && !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        return ['count' => $this->get('capco.synthesis.synthesis_element_handler')->countElementsFromSynthesisByType($synthesis, $type)];
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
     * @Get("/syntheses/{synthesis_id}/elements/{element_id}")
     * @ParamConverter("element", options={"mapping": {"element_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(serializerEnableMaxDepthChecks=true, serializerGroups={"ElementDetails", "UserDetails", "LogDetails"})
     */
    public function getSynthesisElementAction($synthesis_id, SynthesisElement $element)
    {
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
        $form = $this->createForm(new SynthesisElementForm(false), $element);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            throw new BadRequestHttpException($form->getErrors(true));
        }

        $element = $this->get('capco.synthesis.synthesis_element_handler')->createElementInSynthesis(
            $element,
            $synthesis,
            $this->getUser()
        );

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
    public function updateSynthesisElementAction(Request $request, Synthesis $synthesis, SynthesisElement $element)
    {
        $form = $this->createForm(new SynthesisElementForm(true), $element);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            throw new BadRequestHttpException($form->getErrors(true));
        }

        $element = $this->get('capco.synthesis.synthesis_element_handler')->updateElementInSynthesis(
            $element,
            $synthesis
        );

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
     * @Get("/syntheses/{synthesis_id}/elements/{element_id}/history")
     * @ParamConverter("synthesis", options={"mapping": {"synthesis_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("element", options={"mapping": {"element_id": "id"}})
     * @View(serializerGroups={"Elements", "LogDetails"})
     */
    public function getSynthesisElementHistoryAction(Request $request, Synthesis $synthesis, SynthesisElement $element)
    {
        $logs = $this->get('capco.synthesis.synthesis_element_handler')->getLogsForElement($element);

        return $logs;
    }
}
