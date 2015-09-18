<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Form\ArgumentType as ArgumentForm;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class ArgumentController extends Controller
{

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/arguments/{argumentId}/edit", name="app_consultation_edit_argument")
     * @Template("CapcoAppBundle:Argument:update.html.twig")
     *
     * @param $request
     * @param $consultationSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $argumentId
     *
     * @return array
     */
    public function updateArgumentAction($consultationSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $argumentId, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $argument = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getOneById($argumentId);

        if ($argument == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('argument.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $argument->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('argument.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $argument->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $consultation = $currentStep->getConsultation();

        $userCurrent = $this->getUser()->getId();
        $userPostArgument = $argument->getAuthor()->getId();

        if ($userCurrent !== $userPostArgument) {
            throw new AccessDeniedException($this->get('translator')->trans('argument.error.not_author', array(), 'CapcoAppBundle'));
        }

        $form = $this->createForm(new ArgumentForm('edit'), $argument);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $argument->resetVotes();
                $em->persist($argument);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('argument.update.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('argument.update.error'));
            }
        }

        return [
            'form' => $form->createView(),
            'argument' => $argument,
            'opinion' => $opinion,
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/arguments/{argumentId}/delete", name="app_consultation_delete_argument")
     * @Template("CapcoAppBundle:Argument:delete.html.twig")
     *
     * @param $request
     * @param $consultationSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $argumentId
     *
     * @return array
     */
    public function deleteArgumentAction($consultationSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $argumentId, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $argument = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getOneById($argumentId);

        if ($argument == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('argument.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $argument->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('argument.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $argument->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $consultation = $currentStep->getConsultation();

        $userCurrent = $this->getUser()->getId();
        $userPostArgument = $argument->getAuthor()->getId();

        if ($userCurrent !== $userPostArgument) {
            throw new AccessDeniedException($this->get('translator')->trans('argument.error.not_author', array(), 'CapcoAppBundle'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($argument);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('argument.delete.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('argument.delete.error'));
            }
        }

        return [
            'form' => $form->createView(),
            'argument' => $argument,
            'opinion' => $opinion,
        ];
    }
}
