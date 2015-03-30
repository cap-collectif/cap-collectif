<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
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

class OpinionController extends Controller
{
    /**
     * @Route("/secure/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/remove/{opinionVote}", name="app_consultation_cancel_vote")
     *
     * @param $request
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $opinionVote
     *
     * @return array
     */
    public function deleteOpinionVoteAction($consultationSlug, $opinionTypeSlug, $opinionSlug, OpinionVote $opinionVote, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug);

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
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.vote.delete.success', array(), 'CapcoAppBundle'));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('argument.vote.csrf_error', array(), 'CapcoAppBundle'));
            }
        }

        return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $opinion->getConsultation()->getSlug(), 'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
    }

    /**
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/add", name="app_consultation_new_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinionTypeSlug": "slug"}})
     *
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @Template("CapcoAppBundle:Opinion:create.html.twig")
     *
     * @return array
     */
    public function createOpinionAction(Consultation $consultation, OpinionType $opinionType, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        if (false == $consultation->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('consultation.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        if (!$opinionType->getIsEnabled()) {
            throw new NotFoundHttpException();
        }

        $opinion = new Opinion();
        $opinion->setAuthor($this->getUser());
        $opinion->setOpinionType($opinionType);
        $opinion->setIsEnabled(true);
        $opinion->setConsultation($consultation);

        $form = $this->createForm(new OpinionForm(), $opinion);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($opinion);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.create.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.create.error'));
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/delete", name="app_consultation_delete_opinion")
     *
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $consultationSlug
     * @param $opinionSlug
     * @param $request
     * @Template("CapcoAppBundle:Opinion:delete.html.twig")
     *
     * @return array
     */
    public function deleteOpinionAction($consultationSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

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

                return $this->redirect($this->generateUrl('app_consultation_show', ['slug' => $consultation->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.delete.error'));
            }
        }

        return array(
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/edit", name="app_consultation_edit_opinion")
     * @Template("CapcoAppBundle:Opinion:update.html.twig")
     *
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $request
     *
     * @return array
     */
    public function updateOpinionAction($consultationSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

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

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.update.error'));
            }
        }

        return [
            'form' => $form->createView(),
            'opinion' => $opinion,
            'consultation' => $consultation,
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
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.vote.add.success'));
            } else {
                $previousVote = $em->getUnitOfWork()->getOriginalEntityData($opinionVote);
                if ($previousVote['value'] == $opinionVote->getValue()) {
                    $em->remove($opinionVote);
                    $em->flush();
                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('opinion.vote.delete.success'));
                } else {
                    $em->persist($opinionVote);
                    $em->flush();
                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('opinion.vote.update.success'));
                }
            }
        } else {
            $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('opinion.vote.error'));
        }
    }

    /**
     * Page opinion.
     *
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}", name="app_consultation_show_opinion")
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sort_arguments/{argumentSort}", name="app_consultation_show_opinion_sortarguments", requirements={"argumentsSort" = "popularity|date"})
     *
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $request
     * @param $argumentSort
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     *
     * @return array
     */
    public function showOpinionAction($consultationSlug, $opinionTypeSlug, $opinionSlug, Request $request, $argumentSort = null)
    {
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlugJoinUserReports($consultationSlug, $opinionTypeSlug, $opinionSlug, $this->getUser());

        if ($opinion == null || false == $opinion->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        $currentUrl = $this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $opinion->getConsultation()->getSlug(), 'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(), 'opinionSlug' => $opinion->getSlug()]);
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByOpinionJoinUserReports($opinion, $this->getUser());

        $steps = $this->getDoctrine()->getRepository('CapcoAppBundle:Step')->findBy(array(
            'consultation' => $opinion->getConsultation(),
            'isEnabled' => true,
        ));

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
                'Voter' => $this->getUser(),
                'opinion' => $opinion,
            ));
        }

        if ($previousVote != null) {
            $opinionVote = $previousVote;
            $userHasVoted = true;
        } else {
            $opinionVote = new OpinionVote();
            $opinionVote->setVoter($this->getUser());
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
                        'consultationSlug' => $opinion->getConsultation()->getSlug(),
                        'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                        'opinionSlug' => $opinion->getSlug(),
                    )));
                }
            }

            return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $opinion->getConsultation()->getSlug(), 'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
        } else {
            $sortArgumentsForm->get('argumentSort')->setData($argumentSort);
        }

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $opinion->getConsultation(),
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
