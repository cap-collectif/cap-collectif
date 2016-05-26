<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\OpinionType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use Symfony\Component\HttpFoundation\Response;
use Capco\AppBundle\Entity\OpinionAppendix;

class ConsultationStepsController extends FOSRestController
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/projects/{projectId}/steps/{stepId}/opinions")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @ParamConverter("step", options={"mapping": {"stepId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     *
     * @param Request          $request
     * @param Project          $project
     * @param ConsultationStep $step
     *
     * @return \FOS\RestBundle\View\View
     */
    public function postOpinionAction(Request $request, Project $project, ConsultationStep $step)
    {
        if (!$step->canContribute()) {
            throw new BadRequestHttpException($this->get('translator')->trans('project.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $user = $this->getUser();
        $opinion = (new Opinion())
            ->setAuthor($user)
            ->setStep($step)
            ->setIsEnabled(true)
        ;

        $form = $this->createForm('opinion', $opinion, ['action' => 'create']);
        $form->submit($request->request->all());

        $consultationStepType = $step->getConsultationStepType();

        $opinionType = $opinion->getOpinionType();

        if (!$opinionType->getIsEnabled()) {
            throw new BadRequestHttpException('This opinionType is not enabled.');
        }

        if ($request->request->get('link') && !$opinionType->isLinkable()) {
            throw new BadRequestHttpException('This opinion type is not linkable.');
        }

        $em = $this->get('doctrine.orm.entity_manager');

        if ($form->isValid()) {
            $opinionTypeAppendixTypes = $this->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:OpinionTypeAppendixType')
                ->findBy(
                    ['opinionType' => $opinion->getOpinionType()],
                    ['position' => 'ASC']
            );
            $appendices = $opinion->getAppendices();
            foreach ($opinionTypeAppendixTypes as $otat) {
                $found = false;
                foreach ($appendices as $appendix) {
                    if ($appendix->getAppendixType() == $otat->getAppendixType()) {
                        $found = true;
                    }
                }
                if (!$found) {
                    $app = new OpinionAppendix();
                    $app->setAppendixType($otat->getAppendixType());
                    $app->setOpinion($opinion);
                    $opinion->addAppendice($app);
                }
            }

            $em->persist($opinion);
            $em->flush();

            return $opinion;
        }

        return $this->view($form->getErrors(true), Response::HTTP_BAD_REQUEST);
    }
}
