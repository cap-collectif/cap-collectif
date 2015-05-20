<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Util\Codes;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

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
    public function cgetSynthesesAction()
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
     * @View()
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
}