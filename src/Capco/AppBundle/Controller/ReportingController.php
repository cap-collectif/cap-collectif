<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Form\ReportingType;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class ReportingController extends Controller
{

    /**
     * @Route("/consultation/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/report", name="app_report_opinion")
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @return array
     */
    public function reportingOpinionAction($consultationSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug);

        if($opinion == null){
            throw $this->createNotFoundException($this->get('translator')->trans('Argument not found.'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {

            if ($form->handleRequest($request)->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setOpinion($opinion);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($this->getUser(), $form->get('body')->getData() );
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your report has been saved'));

                return $this->redirect(
                    $this->generateUrl(
                        'app_consultation_show_opinion',
                        [
                            'consultationSlug' => $consultation->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $opinion->getSlug()
                        ]
                    )
                );
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
            'form' => $form->createView()
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/report", name="app_report_source")
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $sourceSlug
     * @param $opinionSlug
     * @return array
     */
    public function reportingSourceAction($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug);

        if($source == null){
            throw $this->createNotFoundException($this->get('translator')->trans('Argument not found.'));
        }

        if (false == $source->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $opinion = $source->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setSource($source);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($this->getUser(), $form->get('body')->getData() );
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your report has been saved'));

                return $this->redirect(
                    $this->generateUrl(
                        'app_consultation_show_opinion',
                        [
                            'consultationSlug' => $consultation->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $opinion->getSlug()
                        ]
                    )
                );
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
            'form' => $form->createView()
        ];
    }

    /**
     * @Route("/consultation/{consultationSlug}/{opinionTypeSlug}/{opinionSlug}/arguments/{argumentId}/report", name="app_report_argument")
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $argumentId
     * @param $opinionSlug
     * @return array
     */
    public function reportingArgumentAction($consultationSlug, $opinionTypeSlug, $opinionSlug, $argumentId, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $argument = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getOneById($consultationSlug, $opinionTypeSlug, $opinionSlug, $argumentId);

        if($argument == null){
            throw $this->createNotFoundException($this->get('translator')->trans('Argument not found.'));
        }

        if (false == $argument->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $opinion = $argument->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setArgument($argument);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($this->getUser(), $form->get('body')->getData() );
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your report has been saved'));

                return $this->redirect(
                    $this->generateUrl(
                        'app_consultation_show_opinion',
                        [
                            'consultationSlug' => $consultation->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $opinion->getSlug()
                        ]
                    )
                );
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
            'form' => $form->createView()
        ];
    }

    /**
     * @Route("/ideas/{ideaSlug}/report", name="app_report_idea")
     * @ParamConverter("idea", class="CapcoAppBundle:Idea", options={"mapping": {"ideaSlug": "slug"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $idea
     * @return array
     */
    public function reportingIdeaAction(Idea $idea, Request $request)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false == $idea->canContribute() ) {
            throw new AccessDeniedException($this->get('translator')->trans('Forbidden'));
        }

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setIdea($idea);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($this->getUser(), $form->get('body')->getData() );
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your report has been saved'));
                return $this->redirect($this->generateUrl('app_idea_show', array('slug' => $idea->getSlug())));
            }
        }

        return [
            'idea' => $idea,
            'form' => $form->createView()
        ];
    }
}
