<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Form\OpinionsType as OpinionForm;
use Capco\AppBundle\Form\ArgumentType as ArgumentForm;
use Capco\AppBundle\Form\OpinionVoteType as OpinionVoteForm;
use Capco\AppBundle\Form\ArgumentsSortType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\OpinionVoteChangedEvent;

class OpinionController extends Controller
{
    /**
     * @Route("/secure/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/remove/{opinionVote}", name="app_consultation_cancel_vote")
     *
     * @param $request
     * @param $consultationSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $opinionVote
     *
     * @return array
     */
    public function deleteOpinionVoteAction($consultationSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, OpinionVote $opinionVote, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($opinionSlug);

        if (null == $opinion) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        if ($request->getMethod() == 'POST') {
            if ($this->isCsrfTokenValid('remove_opinion_vote', $request->get('_csrf_token'))) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($opinionVote);

                $this->get('event_dispatcher')->dispatch(
                    CapcoAppBundleEvents::OPINION_VOTE_CHANGED,
                    new OpinionVoteChangedEvent($opinionVote, 'remove')
                );

                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.vote.delete.success', array(), 'CapcoAppBundle'));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('argument.vote.csrf_error', array(), 'CapcoAppBundle'));
            }
        }

        return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultationSlug, 'stepSlug' => $opinion->getStep()->getSlug(), 'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
    }

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/add", name="app_consultation_new_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @ParamConverter("currentStep", class="CapcoAppBundle:ConsultationStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinionTypeSlug": "slug"}})
     *
     * @param $opinionType
     * @param $consultation
     * @param $currentStep
     * @param $request
     * @Template("CapcoAppBundle:Opinion:create.html.twig")
     *
     * @return array
     */
    public function createOpinionAction(Consultation $consultation, ConsultationStep $currentStep, OpinionType $opinionType, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        if (false == $currentStep->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('consultation.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        if (!$opinionType->getIsEnabled()) {
            throw new NotFoundHttpException();
        }

        $opinion = new Opinion();
        $opinion->setAuthor($this->getUser());
        $opinion->setOpinionType($opinionType);
        $opinion->setIsEnabled(true);
        $opinion->setStep($currentStep);

        $form = $this->createForm(new OpinionForm(), $opinion);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.create.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.create.error'));
            }
        }

        return [
            'consultation' => $consultation,
            'currentStep' => $currentStep,
            'opinionType' => $opinionType,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/delete", name="app_consultation_delete_opinion")
     *
     * @param $consultationSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $consultationSlug
     * @param $opinionSlug
     * @param $request
     * @Template("CapcoAppBundle:Opinion:delete.html.twig")
     *
     * @return array
     */
    public function deleteOpinionAction($consultationSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $consultation = $currentStep->getConsultation();

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.not_author', array(), 'CapcoAppBundle'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('opinion.delete.success'));

                return $this->redirect($this->generateUrl('app_consultation_show', ['consultationSlug' => $consultation->getSlug(), 'stepSlug' => $currentStep->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.delete.error'));
            }
        }

        return array(
            'opinion' => $opinion,
            'consultation' => $consultation,
            'currentStep' => $currentStep,
            'opinionType' => $opinionType,
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/edit", name="app_consultation_edit_opinion")
     * @Template("CapcoAppBundle:Opinion:update.html.twig")
     *
     * @param $consultationSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $request
     *
     * @return array
     */
    public function updateOpinionAction($consultationSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $consultation = $currentStep->getConsultation();

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.not_author', array(), 'CapcoAppBundle'));
        }

        $form = $this->createForm(new OpinionForm(), $opinion);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $opinion->resetVotes();
                $em->persist($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.update.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.update.error'));
            }
        }

        return [
            'form' => $form->createView(),
            'opinion' => $opinion,
            'consultation' => $consultation,
            'currentStep' => $currentStep,
            'opinionType' => $opinionType,
        ];
    }

    /**
     * @param $opinion
     * @param $opinionVote
     * @param $form
     * @param $request
     * @param $alreadyVoted
     *
     * @return array
     */
    private function handleOpinionVoteForm(Opinion $opinion, OpinionVote $opinionVote, $alreadyVoted = false, Form $form, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            if (!$alreadyVoted) {
                $opinionVote->setOpinion($opinion);
                $em->persist($opinionVote);
                $this->get('event_dispatcher')->dispatch(
                    CapcoAppBundleEvents::OPINION_VOTE_CHANGED,
                    new OpinionVoteChangedEvent($opinionVote, 'add')
                );
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.vote.add.success'));

                return;
            }

            $previousVote = $em->getUnitOfWork()->getOriginalEntityData($opinionVote);
            $em->persist($opinionVote);
            $this->get('event_dispatcher')->dispatch(
                CapcoAppBundleEvents::OPINION_VOTE_CHANGED,
                new OpinionVoteChangedEvent($opinionVote, 'update', $previousVote['value'])
            );
            $em->flush();

            $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.vote.update.success'));

            return;
        }

        $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.vote.error'));
    }

    /**
     * Page opinion.
     *
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_consultation_show_opinion")
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_consultation_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date"})
     *
     * @param $consultationSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $request
     * @param $argumentSort
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     *
     * @return array
     */
    public function showOpinionAction($consultationSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, Request $request, $argumentSort = null)
    {
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlugJoinUserReports($opinionSlug, $this->getUser());

        if ($opinion == null || false == $opinion->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        $currentUrl = $this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultationSlug, 'stepSlug' => $stepSlug, 'opinionTypeSlug' => $opinionTypeSlug, 'opinionSlug' => $opinionSlug]);
        $currentStep = $opinion->getStep();
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByOpinionJoinUserReports($opinion, $this->getUser());

        $steps = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractStep')->getByConsultation($consultationSlug);

        // Argument forms
        $argument = new Argument();
        $argument->setAuthor($this->getUser());

        $argumentFormYes = $this->get('form.factory')->createNamedBuilder('argumentFormYes', new ArgumentForm(), $argument)->getForm();
        $argumentFormNo = $this->get('form.factory')->createNamedBuilder('argumentFormNo', new ArgumentForm(), $argument)->getForm();

        // OpinionVote forms
        $opinionVote = null;
        $previousVote = null;
        $userHasVoted = false;

        if ($this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            $previousVote = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVote')->findOneBy(array(
                'user' => $this->getUser(),
                'opinion' => $opinion,
            ));
        }

        if ($previousVote != null) {
            $opinionVote = $previousVote;
            $userHasVoted = true;
        } else {
            $opinionVote = new OpinionVote();
            $opinionVote->setUser($this->getUser());
        }

        $opinionVoteForm = $this->get('form.factory')->createNamedBuilder('opinionVoteForm', new OpinionVoteForm(), $opinionVote, ['attr' => ['id' => 'opinion_vote_form']])->getForm();

        $sortArgumentsForm = $this->get('form.factory')->createNamedBuilder('sortArgumentsForm', new ArgumentsSortType(), array(
            'action' => $currentUrl,
            'method' => 'POST',
        ))
            ->getForm();

        if ('POST' === $request->getMethod()) {
            $form = null;

            if ($request->request->has('argumentFormYes')) {
                $argument->setType(Argument::TYPE_FOR);
                $form = $argumentFormYes;
                $this->handleCreateArgumentForm($opinion, $argument, $form, $request);
            }

            if ($request->request->has('argumentFormNo')) {
                $argument->setType(Argument::TYPE_AGAINST);
                $form = $argumentFormNo;
                $this->handleCreateArgumentForm($opinion, $argument, $form, $request);
            }

            if ($request->request->has('opinionVoteForm')) {
                $form = $opinionVoteForm;
                $this->handleOpinionVoteForm($opinion, $opinionVote, $userHasVoted, $form, $request);
            }

            if ($request->request->has('sortArgumentsForm')) {
                $form = $sortArgumentsForm;
                $form->handleRequest($request);
                if ($form->isValid()) {
                    $data = $form->getData();

                    return $this->redirect($this->generateUrl('app_consultation_show_opinion_sortarguments', array(
                        'argumentSort' => $data['argumentSort'],
                        'consultationSlug' => $consultationSlug,
                        'stepSlug' => $stepSlug,
                        'opinionTypeSlug' => $opinionTypeSlug,
                        'opinionSlug' => $opinionSlug,
                    )));
                }
            }

            return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultationSlug, 'stepSlug' => $stepSlug, 'opinionTypeSlug' => $opinionTypeSlug, 'opinionSlug' => $opinionSlug]));
        } else {
            $sortArgumentsForm->get('argumentSort')->setData($argumentSort);
        }

        return [
            'currentUrl' => $currentUrl,
            'currentStep' => $currentStep,
            'consultation' => $currentStep->getConsultation(),
            'opinion' => $opinion,
            'sources' => $sources,
            'opinionType' => $opinion->getOpinionType(),
            'votes' => $opinion->getVotes(),
            'consultation_steps' => $steps,
            'argumentFormYes' => $argumentFormYes->createView(),
            'argumentFormNo' => $argumentFormNo->createView(),
            'argumentTypes' => Argument::$argumentTypes,
            'argumentTypesLabels' => Argument::$argumentTypesLabels,
            'previousVote' => $previousVote,
            'opinionVoteTypes' => OpinionVote::$voteTypes,
            'opinionVoteStyles' => OpinionVote::$voteTypesStyles,
            'opinionVoteForm' => $opinionVoteForm->createView(),
            'sortArgumentsForm' => $sortArgumentsForm,
            'argumentSort' => $argumentSort,
        ];
    }

    /**
     * Argument CRUD.
     *
     * @Template("CapcoAppBundle:Argument:create.html.twig")
     *
     * @param $opinion
     * @param $argument
     * @param $form
     * @param $request
     *
     * @return array
     */
    private function handleCreateArgumentForm(Opinion $opinion, Argument $argument, Form $form, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $form->handleRequest($request);

        if ($form->isValid()) {
            $argument->setOpinion($opinion);
            $em = $this->getDoctrine()->getManager();
            $em->persist($argument);
            $em->flush();
            $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('argument.create.success'));
        } else {
            $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('argument.create.error'));
        }
    }
}
