<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Form\OpinionType;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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

class ConsultationStepsController extends FOSRestController
{

    /**
     * Create an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create an opinion.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/consultations/{consultationId}/steps/{stepId}/opinions")
     * @ParamConverter("consultation", options={"mapping": {"consultationId": "id"}})
     * @ParamConverter("step", options={"mapping": {"stepId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionAction(Request $request, Consultation $consultation, ConsultationStep $step)
    {
        // if (!$opinion->canContribute()) {
        //     throw new BadRequestHttpException("Can't add a version to an uncontributable opinion.");
        // }

        // if (!$opinion->getOpinionType()->isVersionable()) {
        //     throw new BadRequestHttpException("Can't add a version to an unversionable opinion.");
        // }

        $user = $this->getUser();
        $opinionVersion = (new Opinion())
            ->setAuthor($user)
            ->setStep($step)
        ;

        $form = $this->createForm(new OpinionApiType(), $opinion);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->persist($opinion);
            $this->getDoctrine()->getManager()->flush();

            return $opinion;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
    }
}
