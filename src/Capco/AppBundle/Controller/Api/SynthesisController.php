<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Event\SynthesisElementChangedEvent;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Util\Codes;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

use Capco\AppBundle\Form\Api\SynthesisType as SynthesisForm;
use Capco\AppBundle\Form\Api\SynthesisElementType as SynthesisElementForm;

/**
 * @Security("has_role('ROLE_ADMIN')")
 */
class SynthesisController extends FOSRestController
{
    /**
     * Get syntheses
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\Synthesis[]
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get the synthesis with all elements",
     *  statusCodes={
     *    200 = "Syntheses found",
     *    404 = "No syntheses",
     *  }
     * )
     *
     * @Get("/syntheses")
     * @View(serializerGroups={"Default"})
     */
    public function getSynthesesAction()
    {
        return $this->get('doctrine.orm.entity_manager')->getRepository('CapcoAppBundle:Synthesis\Synthesis')->findAll();
    }

    /**
     * Get a synthesis by id
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get the synthesis with all elements",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Synthesis does not exist",
     *  }
     * )
     *
     * @Get("/syntheses/{id}")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}})
     * @View(serializerGroups={"Default"})
     */
    public function getSynthesisAction(Synthesis $synthesis)
    {
        return $synthesis;
    }

    /**
     * Create a synthesis from submitted data
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
     * @Post("/syntheses")
     * @ParamConverter("synthesis", converter="fos_rest.request_body")
     * @View(serializerGroups={"Default"})
     */
    public function createSynthesisAction(Synthesis $synthesis, ConstraintViolationListInterface $validationErrors)
    {
        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $em = $this->get('doctrine.orm.entity_manager');
        $em->persist($synthesis);
        $em->flush();
        $url = $this->generateUrl('get_synthesis', ['id' => $synthesis->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
        return $this->redirectView($url, Codes::HTTP_CREATED);
    }

    /**
     * Update a synthesis
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
     * @Put("/syntheses/{id}")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}})
     * @View(serializerGroups={"Default"})
     */
    public function updateSynthesisAction(Request $request, Synthesis $synthesis)
    {
        $form = $this->createForm(new SynthesisForm(), $synthesis);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->flush();
            $url = $this->generateUrl('get_synthesis', ['id' => $synthesis->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
            return $this->redirectView($url);
        }
        return $form;
    }

    /**
     * Get synthesis elements
     *
     * @return array|\Capco\AppBundle\Entity\Synthesis\SynthesisElement[]
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all the elements of a synthesis",
     *  statusCodes={
     *    200 = "Syntheses element found",
     *    404 = "No syntheses element found",
     *  }
     * )
     *
     * @Get("/syntheses/{id}/elements")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}})
     * @View(serializerGroups={"Default", "Details"})
     */
    public function getSynthesisElementsAction(Synthesis $synthesis)
    {
        return $this->get('doctrine.orm.entity_manager')->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->findBy(array(
            'synthesis' => $synthesis,
        ));
    }

    /**
     * Get a synthesis element by id
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
     * @ParamConverter("synthesis", options={"mapping": {"synthesis_id": "id"}})
     * @ParamConverter("element", options={"mapping": {"element_id": "id"}})
     * @View(serializerGroups={"Default", "Details"})
     */
    public function getSynthesisElementAction(Synthesis $synthesis, SynthesisElement $element)
    {
        return $element;
    }

    /**
     * Create a synthesis element
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
     * @Post("/syntheses/{id}/elements")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}})
     * @ParamConverter("element", converter="fos_rest.request_body")
     * @View(serializerGroups={"Default", "Details"})
     */
    public function createSynthesisElementAction(Synthesis $synthesis, SynthesisElement $element, ConstraintViolationListInterface $validationErrors)
    {
        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $element->setSynthesis($synthesis);

        $em = $this->get('doctrine.orm.entity_manager');
        $em->persist($element);
        $em->flush();

        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::SYNTHESIS_ELEMENT_CHANGED,
            new SynthesisElementChangedEvent($element, $this->getUser(), 'create')
        );

        $url = $this->generateUrl('get_synthesis_element', ['synthesis_id' => $synthesis->getId(), 'element_id' => $element->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
        return $this->redirectView($url, Codes::HTTP_CREATED);
    }

    /**
     * Update a synthesis element
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
     * @Put("/syntheses/{synthesis_id}/elements/{element_id}")
     * @ParamConverter("synthesis", options={"mapping": {"synthesis_id": "id"}})
     * @ParamConverter("element", options={"mapping": {"element_id": "id"}})
     * @View(serializerGroups={"Default", "Details"})
     */
    public function updateSynthesisElementAction(Request $request, Synthesis $synthesis, SynthesisElement $element)
    {
        $form = $this->createForm(new SynthesisElementForm(), $element);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {

            $em = $this->get('doctrine.orm.entity_manager');
            $em->flush();

            $this->get('event_dispatcher')->dispatch(
                CapcoAppBundleEvents::SYNTHESIS_ELEMENT_CHANGED,
                new SynthesisElementChangedEvent($element, $this->getUser(), 'update')
            );

            $url = $this->generateUrl('get_synthesis_element', ['synthesis_id' => $synthesis->getId(), 'element_id' => $element->getId()], UrlGeneratorInterface::ABSOLUTE_URL);
            return $this->redirectView($url);
        }
        return $form;
    }
}