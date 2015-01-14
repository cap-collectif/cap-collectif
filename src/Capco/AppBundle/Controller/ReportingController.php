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
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/report", name="app_report_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @return array
     */
    public function reportingOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

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
                            'consultation_slug' => $consultation->getSlug(),
                            'opinion_type_slug' => $opinionType->getSlug(),
                            'opinion_slug' => $opinion->getSlug()
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
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/{source_slug}/report", name="app_report_source")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @ParamConverter("source", class="CapcoAppBundle:Source", options={"mapping": {"source_slug": "slug"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $source
     * @param $opinion
     * @return array
     */
    public function reportingSourceAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Source $source, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

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
                            'consultation_slug' => $consultation->getSlug(),
                            'opinion_type_slug' => $opinionType->getSlug(),
                            'opinion_slug' => $opinion->getSlug()
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
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/report/{argument_id}", name="app_report_argument")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @ParamConverter("argument", class="CapcoAppBundle:Argument", options={"mapping": {"argument_id": "id"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $argument
     * @param $opinion
     * @return array
     */
    public function reportingArgumentAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Argument $argument, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

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
                            'consultation_slug' => $consultation->getSlug(),
                            'opinion_type_slug' => $opinionType->getSlug(),
                            'opinion_slug' => $opinion->getSlug()
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
     * @Route("/idea/report/{idea_slug}", name="app_report_idea")
     * @ParamConverter("idea", class="CapcoAppBundle:Idea", options={"mapping": {"idea_slug": "slug"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     * @param $request
     * @param $idea
     * @return array
     */
    public function reportingIdeaAction(Idea $idea, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
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
