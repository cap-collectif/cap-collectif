<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\OpinionType;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\OpinionVersionType;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\Util\Codes;
use JMS\Serializer\SerializationContext;

class OpinionTypesController extends FOSRestController
{

    /**
     * Get an opinionType.
     *
     * @Get("/opinion_types/{id}")
     * @ParamConverter("opinionType", options={"mapping": {"id": "id"}})
     */
    public function getOpinionTypeAction(OpinionType $opinionType)
    {
        $context = SerializationContext::create()
            ->setGroups(['OpinionTypeDetails'])
            ->setSerializeNull(false)
        ;

        $view = $this->view($opinionType, 200)
            ->setSerializationContext($context)
        ;

        $response = $this->handleView($view);
        return $response;
    }

}
