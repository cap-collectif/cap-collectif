<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Form\ReportingType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class ReportingController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}/report", name="app_report_opinion_version", defaults={"_feature_flags" = "reporting"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}/report", name="app_report_opinion_version", defaults={"_feature_flags" = "reporting"})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     */
    public function reportingOpinionVersionAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $versionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($opinionSlug);
        $version = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVersion')->findOneBySlug($versionSlug);

        if ($version == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false == $opinion->canDisplay()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            if ($form->handleRequest($request)->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setOpinionVersion($version);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect(
                    $this->generateUrl(
                        'app_project_show_opinion_version',
                        [
                            'projectSlug' => $project->getSlug(),
                            'stepSlug' => $currentStep->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $opinion->getSlug(),
                            'versionSlug' => $version->getSlug(),
                        ]
                    )
                );
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'opinion' => $opinion,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/report", name="app_report_opinion", defaults={"_feature_flags" = "reporting"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/report", name="app_report_opinion", defaults={"_feature_flags" = "reporting"})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     *
     * @param $request
     * @param $projectSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     *
     * @return array
     */
    public function reportingOpinionAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false == $opinion->canDisplay()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            if ($form->handleRequest($request)->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setOpinion($opinion);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect(
                    $this->generateUrl(
                        'app_project_show_opinion',
                        [
                            'projectSlug' => $project->getSlug(),
                            'stepSlug' => $currentStep->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $opinion->getSlug(),
                        ]
                    )
                );
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'opinion' => $opinion,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/report", name="app_report_source", defaults={"_feature_flags" = "reporting"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/report", name="app_report_source", defaults={"_feature_flags" = "reporting"})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     *
     * @param $request
     * @param $projectSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $sourceSlug
     * @param $opinionSlug
     *
     * @return array
     */
    public function reportingSourceAction($projectSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($sourceSlug);

        if ($source == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('source.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false == $source->canDisplay()) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $opinion = $source->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setSource($source);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect(
                    $this->get('capco.url.resolver')->getObjectUrl($source)
                );
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'opinion' => $opinion,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/arguments/{argumentId}/report", name="app_report_argument", defaults={"_feature_flags" = "reporting"})
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/arguments/{argumentId}/report", name="app_report_argument", defaults={"_feature_flags" = "reporting"})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     *
     * @param $request
     * @param $projectSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $argumentId
     * @param $opinionSlug
     *
     * @return array
     */
    public function reportingArgumentAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $argumentId, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $argument = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getOneById($argumentId);

        if ($argument == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('argument.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false == $argument->canDisplay()) {
            throw new AccessDeniedException($this->get('translator')->trans('argument.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $opinion = $argument->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setArgument($argument);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect(
                    $this->get('capco.url.resolver')->getObjectUrl($argument)
                );
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'opinion' => $opinion,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/ideas/{idea_slug}/report", name="app_report_idea", defaults={"_feature_flags" = "ideas,reporting"})
     * @ParamConverter("idea", class="CapcoAppBundle:Idea", options={"mapping": {"idea_slug": "slug"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     *
     * @param $request
     * @param $idea
     *
     * @return array
     */
    public function reportingIdeaAction(Idea $idea, Request $request)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        if (false == $idea->canDisplay()) {
            throw new AccessDeniedException($this->get('translator')->trans('idea.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setIdea($idea);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect($this->generateUrl('app_idea_show', ['slug' => $idea->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'idea' => $idea,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/comments/{commentId}/report", name="app_report_comment", defaults={"_feature_flags" = "reporting"})
     * @ParamConverter("comment", class="CapcoAppBundle:Comment", options={"mapping": {"commentId": "id"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     *
     * @param $request
     * @param $comment
     *
     * @return array
     */
    public function reportingCommentAction(Comment $comment, Request $request)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        if (false == $comment->canDisplay()) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $user = $this->getUser();

        if ($comment->userHasReport($user)) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.already_reported', [], 'CapcoAppBundle'));
        }

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setComment($comment);
                $reporting->setReporter($user);
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect(
                    $this->get('capco.url.resolver')->getObjectUrl($comment)
                );
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'comment' => $comment,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}/report", name="app_report_proposal", defaults={"_feature_flags" = "reporting"})
     * @Security("has_role('ROLE_USER')")
     * @ParamConverter("proposal", options={"mapping": {"proposalSlug": "slug"}})
     * @Template("CapcoAppBundle:Reporting:create.html.twig")
     *
     * @param $request
     * @param $projectSlug
     * @param $stepSlug
     * @param $proposalSlug
     *
     * @return array
     */
    public function reportingProposalAction($projectSlug, $stepSlug, Proposal $proposal, Request $request)
    {
        if (false == $proposal->canDisplay()) {
            throw new AccessDeniedException();
        }

        $currentStep = $proposal->getProposalForm()->getStep();
        $project = $currentStep->getProject();

        $reporting = new Reporting();
        $form = $this->createForm(new ReportingType(), $reporting);

        if ($request->getMethod() == 'POST') {
            if ($form->handleRequest($request)->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $reporting->setProposal($proposal);
                $reporting->setReporter($this->getUser());
                $this->get('capco.notify_manager')->sendNotifyMessage($reporting);
                $em->persist($reporting);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('reporting.success'));

                return $this->redirect(
                    $this->generateUrl(
                        'app_project_show_proposal',
                        [
                            'projectSlug' => $project->getSlug(),
                            'stepSlug' => $currentStep->getSlug(),
                            'proposalSlug' => $proposal->getSlug(),
                        ]
                    )
                );
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('reporting.error'));
            }
        }

        return [
            'proposal' => $proposal,
            'form' => $form->createView(),
        ];
    }
}
